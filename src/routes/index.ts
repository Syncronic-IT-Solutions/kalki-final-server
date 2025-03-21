import { Router } from "express";
import authenticateUserToken from "../middleWare/userAuthmiddleware";
import authenticateAgentToken from "../middleWare/agentMiddleware";
import adminauthrouter from "./admin/adminUserroute";
import agentRouter from "./agent/agentroute";
import userRegistration from "./users/userRegistration";
import userAuth from "./users/userAuth";
import userDetailsUpdate from "./users/usersDetailsroute";
import createPuja from "./pujas/pujaroute";
import agentAuth from "./agent/agentLogin";
import agentDetails from "./agent/agentDetailsRoutes";
import userslist from "./admin/allUsers";
import createTemple from "./temples/templeroute";
import allTemples from "./temples/allTemples";
import booking from "./bookings/bookingroute";
import reviews from "./bookings/submitReview";

const routes = Router();

routes.use("/admin",adminauthrouter)
routes.use("/users",authenticateUserToken,userslist)
routes.use("/agent",authenticateUserToken,agentRouter)
routes.use("/agentlogin",agentAuth)
routes.use("/agentdetails",authenticateAgentToken,agentDetails)
routes.use("/userregister",userRegistration)
routes.use("/userlogin",userAuth)
routes.use("/userdetails",authenticateUserToken,userDetailsUpdate)
routes.use("/booking",authenticateUserToken,booking)
routes.use("/puja",createPuja)
routes.use("/temples",authenticateUserToken,createTemple)
routes.use("/alltemples",allTemples)
routes.use("/reviews",authenticateUserToken,reviews)


export default routes
