import UserModel from "../db/models/users/usersModel";
import TemplesModel from "./models/temples/TemplesModel";
import PujaModel from "../db/models/pujas/PujaModel";
import PujaDatesModel from "../db/models/pujas/PujaDtaesPackagesModel";
// import ReviewsModel from "../db/models/pujas/ReviewsModel";
// import AgentModel from "./models/agent/AgentModel";
// import AgentDetailsModel from "./models/agent/AgentDetails";
// import AssignedTasksModel from "./models/agent/AssignedTasks";
// import BookingHistoryModel from "./models/bookings/BookingHistoryModel";

const isDev = process.env.NODE_ENV === 'development'; 

async function init() {
  try {
await UserModel.sync({ force: true });  
await TemplesModel.sync({ force: true });
await PujaModel.sync({ force: true });
await PujaDatesModel.sync({ force: true });
// await BookingHistoryModel.sync({ force: true, alter: true });
// await AgentModel.sync({ force: true });
// await AgentDetailsModel.sync({ force: true });
// await AssignedTasksModel.sync({ force: true });
// await ReviewsModel.sync({ force: true });



    console.log('Models and associations have been set up successfully!');
    console.log('Database sync completed successfully!');
  } catch (error) {
    console.error('Error syncing database models:', error);
  }
}

const dbInit = () => {
  init();
};

export default dbInit;
