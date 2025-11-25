import express from 'express';
import configRoutes from './rotues/index'
 

const app = express();

app.use(express.json());

configRoutes(app)

app.listen(3000, () => {
    console.log("Express server has started!");
})

export const simpleSignInServer = app;