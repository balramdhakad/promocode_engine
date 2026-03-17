import app from "./app.js";
import env from "./config/env.js";


const PORT = env.serverConfig.PORT

const startServer = async () => {
    try {
        app.listen(PORT,()=>{
            console.log(`Server is running on PORT : ${PORT}`)
        })
    } catch (error) {
        console.log(`Error while starting the server : ${error}`)
        process.exit(1)
    }
};


startServer()

