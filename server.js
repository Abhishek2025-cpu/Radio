const app = require('./app');
const connectMongo = require('./config/db.mongo');


const PORT = process.env.PORT || 2026;
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

(async () => {
  await connectMongo();


  app.listen(PORT, () => {
    console.log(`uRadio server running on port ${PORT}`);
  });
})();
