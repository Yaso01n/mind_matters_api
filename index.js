const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config(); // Load environment variables from .env file

const connectionModule = require('./DataBase/connection');

const UserRoute = require('./routes/userRouter');
const DoctorRoute = require('./routes/doctorRouter');
const OrganizationRoute = require('./routes/organizationRouter');
const AppointmentRoute = require('./routes/appointmentRouter');
const RecordRoute = require('./routes/recordRouter');


const MindMatters_app = express();
MindMatters_app.use(cors());
const PORT =  process.env.PORT || 3000;

//====================================================================
MindMatters_app.use(cors({                     
  origin: 'http://localhost:3000',
}));

connectionModule.connect((err) => {
  if (err){
    console.error('Error connecting to database:', err);
    return;
  }

  console.log('DATABASE CONNECTED');
  
  MindMatters_app.listen(PORT, () => {
    console.log(`SERVER: http://localhost:${PORT}`);
  });
});
//====================================================================
MindMatters_app.use(express.json());
MindMatters_app.use('/', UserRoute);
MindMatters_app.use('/', DoctorRoute);
MindMatters_app.use('/', OrganizationRoute);
MindMatters_app.use('/', AppointmentRoute);
MindMatters_app.use('/', RecordRoute);


