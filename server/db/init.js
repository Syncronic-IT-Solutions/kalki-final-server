"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AdminUserModel_1 = __importDefault(require("./models/admin/AdminUserModel"));
const usersModel_1 = __importDefault(require("../db/models/users/usersModel"));
const TemplesModel_1 = __importDefault(require("./models/temples/TemplesModel"));
const PujaModel_1 = __importDefault(require("../db/models/pujas/PujaModel"));
const PujaPackagesModel_1 = __importDefault(require("./models/pujas/PujaPackagesModel"));
const ReviewsModel_1 = __importDefault(require("../db/models/pujas/ReviewsModel"));
const AgentModel_1 = __importDefault(require("./models/agent/AgentModel"));
const AgentDetails_1 = __importDefault(require("./models/agent/AgentDetails"));
const AssignedTasks_1 = __importDefault(require("./models/agent/AssignedTasks"));
const TempleImagesModel_1 = __importDefault(require("./models/temples/TempleImagesModel"));
const BookingHistoryModel_1 = __importDefault(require("../db/models/bookings/BookingHistoryModel")); // Import missing model
const CompletedPujaMedia_1 = __importDefault(require("./models/bookings/CompletedPujaMedia")); // Import missing model
const TrackingModel_1 = __importDefault(require("./models/bookings/TrackingModel"));
const CouponModel_1 = __importDefault(require("./models/coupons/CouponModel"));
const CouponUsageHistoryModel_1 = __importDefault(require("./models/coupons/CouponUsageHistoryModel"));
const PackageFeaturesModel_1 = __importDefault(require("./models/pujas/PackageFeaturesModel"));
// import UserWalletModel from "./models/users/UserWalletModel";
// import UserWalletTransactionsModel from "./models/users/UserWalletTransactionsModel";
const isDev = process.env.NODE_ENV === 'development';
function init() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Sync models
            yield AdminUserModel_1.default.sync({ alter: true });
            yield usersModel_1.default.sync({ alter: true });
            yield TemplesModel_1.default.sync({ alter: true });
            yield TempleImagesModel_1.default.sync({ alter: true });
            yield PujaModel_1.default.sync({ alter: true });
            yield PujaPackagesModel_1.default.sync({ alter: true });
            yield PackageFeaturesModel_1.default.sync({ alter: true });
            yield AgentModel_1.default.sync({ alter: true });
            yield AgentDetails_1.default.sync({ alter: true });
            yield AssignedTasks_1.default.sync({ alter: true });
            yield ReviewsModel_1.default.sync({ alter: true });
            yield BookingHistoryModel_1.default.sync({ alter: true });
            yield CompletedPujaMedia_1.default.sync({ alter: true });
            yield TrackingModel_1.default.sync({ alter: true });
            yield CouponModel_1.default.sync({ alter: true });
            yield CouponUsageHistoryModel_1.default.sync({ alter: true });
            // await UserWalletModel.sync({ alter: true });
            // await UserWalletTransactionsModel.sync({ alter: true });
            // Initialize associations
            usersModel_1.default.associate({ ReviewsModel: ReviewsModel_1.default, BookingHistoryModel: BookingHistoryModel_1.default });
            ReviewsModel_1.default.associate({ UserModel: usersModel_1.default, PujaModel: PujaModel_1.default, BookingHistoryModel: BookingHistoryModel_1.default });
            console.log('Models and associations have been set up successfully!');
            console.log('Database sync completed successfully!');
        }
        catch (error) {
            console.error('Error syncing database models:', error);
        }
    });
}
const dbInit = () => {
    init();
};
exports.default = dbInit;
