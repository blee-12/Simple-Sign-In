import express from "express";

const app = express();

app.use(express.json());

app.use("/", (req, res) => {
    res.json("Hello World!");
})

app.listen(3000, () => {
  console.log(`Server running on port 3000`);
});
