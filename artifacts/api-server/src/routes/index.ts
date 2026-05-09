import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import participantsRouter from "./participants";
import staffRouter from "./staff";
import shiftsRouter from "./shifts";
import timesheetsRouter from "./timesheets";
import caseNotesRouter from "./case_notes";
import incidentsRouter from "./incidents";
import medicationsRouter from "./medications";
import serviceAgreementsRouter from "./service_agreements";
import goalsRouter from "./goals";
import complianceRouter from "./compliance";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(participantsRouter);
router.use(staffRouter);
router.use(shiftsRouter);
router.use(timesheetsRouter);
router.use(caseNotesRouter);
router.use(incidentsRouter);
router.use(medicationsRouter);
router.use(serviceAgreementsRouter);
router.use(goalsRouter);
router.use(complianceRouter);
router.use(dashboardRouter);

export default router;
