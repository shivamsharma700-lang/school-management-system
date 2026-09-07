import { lazy, Suspense, type ReactElement } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/AppLayout";
import { useAuth } from "./lib/auth";
import { ForgotPasswordPage, LoginPage } from "./pages/LoginPage";
import { HomePage } from "./pages/HomePage";
import {
  AboutPage,
  AcademicsPage,
  AdmissionsPagePublic,
  CampusPage,
  ContactPage,
  EventsPagePublic,
  GalleryPage,
  SportsPagePublic,
  StudentLifePage,
  TransportPagePublic,
} from "./pages/PublicPages";

const DashboardPage = lazy(() => import("./pages/DashboardPage").then((m) => ({ default: m.DashboardPage })));
const BranchesPage = lazy(() => import("./pages/CatalogPages").then((m) => ({ default: m.BranchesPage })));
const BranchDetailPage = lazy(() => import("./pages/CatalogPages").then((m) => ({ default: m.BranchDetailPage })));
const YearsPage = lazy(() => import("./pages/CatalogPages").then((m) => ({ default: m.YearsPage })));
const ClassesPage = lazy(() => import("./pages/CatalogPages").then((m) => ({ default: m.ClassesPage })));
const SectionDetailPage = lazy(() => import("./pages/CatalogPages").then((m) => ({ default: m.SectionDetailPage })));
const SubjectsPage = lazy(() => import("./pages/CatalogPages").then((m) => ({ default: m.SubjectsPage })));
const StudentsPage = lazy(() => import("./pages/PeoplePages").then((m) => ({ default: m.StudentsPage })));
const StudentProfilePage = lazy(() => import("./pages/PeoplePages").then((m) => ({ default: m.StudentProfilePage })));
const ChildrenPage = lazy(() => import("./pages/PortalPages").then((m) => ({ default: m.ChildrenHubPage })));
const UsersPage = lazy(() => import("./pages/PeoplePages").then((m) => ({ default: m.UsersPage })));
const StaffPage = lazy(() => import("./pages/PeoplePages").then((m) => ({ default: m.StaffPage })));
const TeachersPage = lazy(() => import("./pages/PeoplePages").then((m) => ({ default: m.TeachersPage })));
const TeacherProfilePage = lazy(() => import("./pages/PeoplePages").then((m) => ({ default: m.TeacherProfilePage })));
const GuardiansPage = lazy(() => import("./pages/PeoplePages").then((m) => ({ default: m.GuardiansPage })));
const TimetablePage = lazy(() => import("./pages/AcademicOpsPages").then((m) => ({ default: m.TimetablePage })));
const AttendancePage = lazy(() => import("./pages/AcademicOpsPages").then((m) => ({ default: m.AttendancePage })));
const HomeworkPage = lazy(() => import("./pages/AcademicOpsPages").then((m) => ({ default: m.HomeworkPage })));
const ExamsPage = lazy(() => import("./pages/AcademicOpsPages").then((m) => ({ default: m.ExamsPage })));
const FeesPage = lazy(() => import("./pages/FinancePages").then((m) => ({ default: m.FeesPage })));
const InvoicesPage = lazy(() => import("./pages/FinancePages").then((m) => ({ default: m.InvoicesPage })));
const PaymentsPage = lazy(() => import("./pages/FinancePages").then((m) => ({ default: m.PaymentsPage })));
const LibraryPage = lazy(() => import("./pages/CampusPages").then((m) => ({ default: m.LibraryPage })));
const TransportPage = lazy(() => import("./pages/CampusPages").then((m) => ({ default: m.TransportPage })));
const NoticesPage = lazy(() => import("./pages/CampusPages").then((m) => ({ default: m.NoticesPage })));
const ComplaintsPage = lazy(() => import("./pages/CampusPages").then((m) => ({ default: m.ComplaintsPage })));
const NotificationsPage = lazy(() => import("./pages/CampusPages").then((m) => ({ default: m.NotificationsPage })));
const LeavePage = lazy(() => import("./pages/CampusPages").then((m) => ({ default: m.LeavePage })));
const ReportsPage = lazy(() => import("./pages/InsightPages").then((m) => ({ default: m.ReportsPage })));
const AuditPage = lazy(() => import("./pages/InsightPages").then((m) => ({ default: m.AuditPage })));
const SettingsPage = lazy(() => import("./pages/InsightPages").then((m) => ({ default: m.SettingsPage })));
const BusTrackingPage = lazy(() => import("./pages/PortalPages").then((m) => ({ default: m.BusTrackingPage })));
const MarksResultsPage = lazy(() => import("./pages/PortalPages").then((m) => ({ default: m.MarksResultsPage })));
const StaffAttendancePage = lazy(() => import("./pages/PortalPages").then((m) => ({ default: m.StaffAttendancePage })));
const CommunicationPage = lazy(() => import("./pages/PortalPages").then((m) => ({ default: m.CommunicationPage })));
const AnalyticsPage = lazy(() => import("./pages/PortalPages").then((m) => ({ default: m.AnalyticsPage })));
const ReceiptsPage = lazy(() => import("./pages/PortalPages").then((m) => ({ default: m.ReceiptsPage })));
const PendingFeesPage = lazy(() => import("./pages/PortalPages").then((m) => ({ default: m.PendingFeesPage })));
const LeaveApprovalsPage = lazy(() => import("./pages/PortalPages").then((m) => ({ default: m.LeaveApprovalsPage })));
const StudyMaterialsPage = lazy(() => import("./pages/PortalPages").then((m) => ({ default: m.StudyMaterialsPage })));
const AttendanceReportsPage = lazy(() => import("./pages/PortalPages").then((m) => ({ default: m.AttendanceReportsPage })));
const EnquiriesPage = lazy(() => import("./pages/ModulePages").then((m) => ({ default: m.EnquiriesPage })));
const ApplicationsPage = lazy(() => import("./pages/ModulePages").then((m) => ({ default: m.ApplicationsPage })));
const EntranceTestsPage = lazy(() => import("./pages/ModulePages").then((m) => ({ default: m.EntranceTestsPage })));
const InterviewsPage = lazy(() => import("./pages/ModulePages").then((m) => ({ default: m.InterviewsPage })));
const AdmissionsPage = lazy(() => import("./pages/ModulePages").then((m) => ({ default: m.AdmissionsPage })));
const PromotionsPage = lazy(() => import("./pages/ModulePages").then((m) => ({ default: m.PromotionsPage })));
const TransfersPage = lazy(() => import("./pages/ModulePages").then((m) => ({ default: m.TransfersPage })));
const DocumentsPage = lazy(() => import("./pages/ModulePages").then((m) => ({ default: m.DocumentsPage })));
const EventsPage = lazy(() => import("./pages/ModulePages").then((m) => ({ default: m.EventsPage })));
const InventoryPage = lazy(() => import("./pages/ModulePages").then((m) => ({ default: m.InventoryPage })));
const HrPage = lazy(() => import("./pages/ModulePages").then((m) => ({ default: m.HrPage })));
const HealthPage = lazy(() => import("./pages/ModulePages").then((m) => ({ default: m.HealthPage })));
const DisciplinePage = lazy(() => import("./pages/ModulePages").then((m) => ({ default: m.DisciplinePage })));
const SportsPage = lazy(() => import("./pages/ModulePages").then((m) => ({ default: m.SportsPage })));
const LabsPage = lazy(() => import("./pages/ModulePages").then((m) => ({ default: m.LabsPage })));
const PtmPage = lazy(() => import("./pages/ModulePages").then((m) => ({ default: m.PtmPage })));
const AlumniPage = lazy(() => import("./pages/ModulePages").then((m) => ({ default: m.AlumniPage })));
const HostelPage = lazy(() => import("./pages/ModulePages").then((m) => ({ default: m.HostelPage })));
const CanteenPage = lazy(() => import("./pages/ModulePages").then((m) => ({ default: m.CanteenPage })));

function Protected({ children }: { children: ReactElement }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <Suspense fallback={<div className="grid h-full place-items-center bg-[#f4f1ea] font-display text-2xl text-[#053321]">Loading the campus…</div>}>
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/academics" element={<AcademicsPage />} />
      <Route path="/admissions" element={<AdmissionsPagePublic />} />
      <Route path="/campus" element={<CampusPage />} />
      <Route path="/student-life" element={<StudentLifePage />} />
      <Route path="/sports" element={<SportsPagePublic />} />
      <Route path="/events" element={<EventsPagePublic />} />
      <Route path="/gallery" element={<GalleryPage />} />
      <Route path="/transport" element={<TransportPagePublic />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route
        path="/app"
        element={
          <Protected>
            <AppLayout />
          </Protected>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="branches" element={<BranchesPage />} />
        <Route path="branches/:id" element={<BranchDetailPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="academic-years" element={<YearsPage />} />
        <Route path="students" element={<StudentsPage />} />
        <Route path="students/:id" element={<StudentProfilePage />} />
        <Route path="children" element={<ChildrenPage />} />
        <Route path="guardians" element={<GuardiansPage />} />
        <Route path="staff" element={<StaffPage />} />
        <Route path="teachers" element={<TeachersPage />} />
        <Route path="teachers/:id" element={<TeacherProfilePage />} />
        <Route path="enquiries" element={<EnquiriesPage />} />
        <Route path="applications" element={<ApplicationsPage />} />
        <Route path="entrance-tests" element={<EntranceTestsPage />} />
        <Route path="interviews" element={<InterviewsPage />} />
        <Route path="admissions" element={<AdmissionsPage />} />
        <Route path="promotions" element={<PromotionsPage />} />
        <Route path="transfers" element={<TransfersPage />} />
        <Route path="documents" element={<DocumentsPage />} />
        <Route path="events" element={<EventsPage />} />
        <Route path="inventory" element={<InventoryPage />} />
        <Route path="hr" element={<HrPage />} />
        <Route path="health" element={<HealthPage />} />
        <Route path="discipline" element={<DisciplinePage />} />
        <Route path="sports" element={<SportsPage />} />
        <Route path="labs" element={<LabsPage />} />
        <Route path="ptm" element={<PtmPage />} />
        <Route path="alumni" element={<AlumniPage />} />
        <Route path="hostel" element={<HostelPage />} />
        <Route path="canteen" element={<CanteenPage />} />
        <Route path="classes" element={<ClassesPage />} />
        <Route path="classes/:classId/sections/:sectionId" element={<SectionDetailPage />} />
        <Route path="subjects" element={<SubjectsPage />} />
        <Route path="timetable" element={<TimetablePage />} />
        <Route path="attendance" element={<AttendancePage />} />
        <Route path="staff-attendance" element={<StaffAttendancePage />} />
        <Route path="attendance-reports" element={<AttendanceReportsPage />} />
        <Route path="homework" element={<HomeworkPage />} />
        <Route path="exams" element={<ExamsPage />} />
        <Route path="marks" element={<MarksResultsPage />} />
        <Route path="results" element={<MarksResultsPage />} />
        <Route path="report-cards" element={<MarksResultsPage />} />
        <Route path="study-materials" element={<StudyMaterialsPage />} />
        <Route path="fees" element={<FeesPage />} />
        <Route path="invoices" element={<InvoicesPage />} />
        <Route path="payments" element={<PaymentsPage />} />
        <Route path="receipts" element={<ReceiptsPage />} />
        <Route path="pending-fees" element={<PendingFeesPage />} />
        <Route path="library" element={<LibraryPage />} />
        <Route path="transport" element={<TransportPage />} />
        <Route path="bus-tracking" element={<BusTrackingPage />} />
        <Route path="notices" element={<NoticesPage />} />
        <Route path="complaints" element={<ComplaintsPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="communication" element={<CommunicationPage />} />
        <Route path="leave" element={<LeavePage />} />
        <Route path="leave-approvals" element={<LeaveApprovalsPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="audit" element={<AuditPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </Suspense>
  );
}
