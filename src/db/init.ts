import AdminUsersModel from "./models/admin/AdminUserModel";
import UserModel from "../db/models/users/usersModel";
import TemplesModel from "./models/temples/TemplesModel";
import PujaModel from "../db/models/pujas/PujaModel";
import PujaPackageModel from "./models/pujas/PujaPackagesModel";
import ReviewsModel from "../db/models/pujas/ReviewsModel";
import AgentModel from "./models/agent/AgentModel";
import AgentDetailsModel from "./models/agent/AgentDetails";
import AssignedTasksModel from "./models/agent/AssignedTasks";
import TempleImagesModel from "./models/temples/TempleImagesModel";

const isDev = process.env.NODE_ENV === 'development';

async function init() {
  try {
    await AdminUsersModel.sync({  alter: true });
    await UserModel.sync({  alter: true });
    await TemplesModel.sync({  alter: true  });
    await TempleImagesModel.sync({  alter: true  });
    await PujaModel.sync({  alter: true  });
    await PujaPackageModel.sync({  alter: true  });
    await AgentModel.sync({  alter: true  });
    await AgentDetailsModel.sync({  alter: true  });
    await AssignedTasksModel.sync({  alter: true  });
    await ReviewsModel.sync({  alter: true  });

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
