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
import BookingHistoryModel from "../db/models/bookings/BookingHistoryModel";  // Import missing model
import CompletedPujaMediaModel from "./models/bookings/CompletedPujaMedia";  // Import missing model
import TrackingModel from "./models/bookings/TrackingModel";
import CouponModel from "./models/coupons/CouponModel";
import UserCouponUsageModel from "./models/coupons/CouponUsageHistoryModel";
import PackageFeaturesModel from "./models/pujas/PackageFeaturesModel";
// import UserWalletModel from "./models/users/UserWalletModel";
// import UserWalletTransactionsModel from "./models/users/UserWalletTransactionsModel";


const isDev = process.env.NODE_ENV === 'development';

async function init() {
  try {
    // Sync models
    await AdminUsersModel.sync({ alter: true });
    await UserModel.sync({ alter: true });
    await TemplesModel.sync({ alter: true });
    await TempleImagesModel.sync({ alter: true });
    await PujaModel.sync({ alter: true });
    await PujaPackageModel.sync({ alter: true });
    await PackageFeaturesModel.sync({ alter: true });

    await AgentModel.sync({ alter: true });
    await AgentDetailsModel.sync({ alter: true });
    await AssignedTasksModel.sync({ alter: true });
    await ReviewsModel.sync({ alter: true });
    await BookingHistoryModel.sync({ alter: true });
    await CompletedPujaMediaModel.sync({ alter: true });
    await TrackingModel.sync({ alter: true });
    await CouponModel.sync({ alter: true });
    await UserCouponUsageModel.sync({ alter: true });
    // await UserWalletModel.sync({ alter: true });
    // await UserWalletTransactionsModel.sync({ alter: true });

    // Initialize associations
    UserModel.associate({ ReviewsModel, BookingHistoryModel });
    ReviewsModel.associate({ UserModel, PujaModel, BookingHistoryModel });

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
