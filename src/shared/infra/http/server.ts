import app, { TechTest } from "./app";

const port = process.env.PORT || 3001;

app.listen(port, () => {
    TechTest.instance.logger.info("🚀 Server Running");
});