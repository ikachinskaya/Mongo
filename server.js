const http = require("http");

const express = require("express");
const mongoose = require("mongoose");
const yup = require("yup");

const DB_NAME = process.env.DB_NAME || "mongoose_db";

mongoose.connect(`mongodb://localhost:27017/${DB_NAME}`).catch((error) => {
  //в этом месте можно создать логгер ошибок
  console.log(error);
  process.exit(1); //закрываем ноду. все, кроме 0 - ошибка. 0-ок
});

const phoneSpecsSchema = yup.object().shape({
  cpu: yup.string().required(),
  ram: yup.number().min(1).required(),
  storage: yup.number().min(1).required(),
});

const PORT = process.env.PORT || 3000;
//================================================================

//создаем схему
const phoneSchema = new mongoose.Schema({
  brand: {
    type: String,
    required: true,
    validate: {
      validator: (value) => /[A-Za-z]{1,64}/.test(value),
    },
  },
  model: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  specs: {
    type: Object,
    required: true,
    validate: {
      validator: (value) => phoneSpecsSchema.isValid(value),
    },
  },
});

//================================================================

//создаем модель
const Phone = mongoose.model("Phones", phoneSchema);

//================================================================
const app = express();

app.use(express.json());

//================================================================
//CRUD
app.post("/", async (req, res, next) => {
  try {
    const { body } = req;
    const phone = await Phone.create(body);
    res.status(201).send({ data: phone });
  } catch (error) {
    next(error);
  }
});

app.get("/", async (req, res, next) => {
  try {
    const phones = await Phone.find();
    res.status(200).send({ data: phones });
  } catch (error) {}
});

app.patch("/:id", async (req, res, next) => {
  try {
    const {
      body,
      params: { id },
    } = req;
    const updatedPhone = await Phone.findOneAndUpdate({ _id: id }, body, {
      returnDocument: "after",
    });
    res.status(200).send(updatedPhone);
  } catch (error) {}
});

app.delete("/:id", async (req, res, next) => {
  try {
    const {
      params: { id },
    } = req;
    const deletedPhone = await Phone.findOneAndDelete({ _id: id });
    res.status(200).send(deletedPhone);
  } catch (error) {}
});
//================================================================
const server = http.createServer(app);

server.listen(PORT, () => {
  console.log("Server is up");
});
