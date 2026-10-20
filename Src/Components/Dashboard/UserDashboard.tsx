import React, { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/Hooks/UseAuth";
import { DashboardLayout } from "./DashboardLayout";
import { DashboardOverview } from "./DashboardOverview";
import { NotesHub } from "./NotesHub";
import { PyqsHub } from "./PyqsHub";
import { SyllabusHub } from "./SyllabusHub";
import { FacultyHub } from "./FacultyHub";
import { LabsHub } from "./LabsHub";
import { AssignmentsTracker } from "./AssignmentsTracker";
import { TimetablePlanner } from "./TimetablePlanner";
import { StudentProfile } from "./StudentProfile";
import { DepartmentNotices } from "./DepartmentNotices";
import { DrmSecureReader } from "./DrmSecureReader";
import { StudentDeskHub } from "./StudentDeskHub";
import { CommunityForumHub } from "./CommunityForumHub";
import { MembershipUpgradeSection } from "./MembershipUpgradeSection";
import { PlanPaywallGuard } from "./PlanPaywallGuard";
import { usePlanAccess } from "@/Hooks/UsePlanAccess";

export function UserDashboard() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { hasTabAccess, getRequiredTierForTab } = usePlanAccess();
  const searchParams = new URLSearchParams(window.location.search);
  const initialTab = searchParams.get("tab") || "overview";
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [readingMaterialId, setReadingMaterialId] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        navigate({ to: "/login" });
      } else if (user?.is_staff || user?.is_superuser || user?.email === "admin@nims.edu.in") {
        navigate({ to: "/admin" });
      }
    }
  }, [isLoading, isAuthenticated, user, navigate]);

  const handleOpenReader = (materialId: string) => {
    setReadingMaterialId(materialId);
  };

  const handleCloseReader = () => {
    setReadingMaterialId(null);
  };

  const renderProtectedTab = (tabId: string, tabTitle: string, component: React.ReactNode) => {
    if (!hasTabAccess(tabId)) {
      return (
        <PlanPaywallGuard
          tabTitle={tabTitle}
          requiredTier={getRequiredTierForTab(tabId)}
          onUpgradeClick={() => setActiveTab("membership")}
        />
      );
    }
    return component;
  };

  return (
    <>
      {readingMaterialId && (
        <DrmSecureReader
          materialId={readingMaterialId}
          onClose={handleCloseReader}
        />
      )}

      <DashboardLayout
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setReadingMaterialId(null);
        }}
        onOpenReader={handleOpenReader}
      >
        {activeTab === "overview" && (
          <DashboardOverview
            onNavigateTab={(tab) => setActiveTab(tab)}
            onOpenReader={handleOpenReader}
          />
        )}
        {activeTab === "notes" &&
          renderProtectedTab("notes", "Handwritten Class Notes Hub", <NotesHub onOpenReader={handleOpenReader} />)}
        {activeTab === "pyqs" &&
          renderProtectedTab("pyqs", "Solved Examination Papers (PYQs)", <PyqsHub onOpenReader={handleOpenReader} />)}
        {activeTab === "syllabus" && <SyllabusHub onOpenReader={handleOpenReader} />}
        {activeTab === "faculty" && <FacultyHub onOpenReader={handleOpenReader} />}
        {activeTab === "labs" &&
          renderProtectedTab("labs", "Handwritten Lab Manuals & Code", <LabsHub onOpenReader={handleOpenReader} />)}
        {activeTab === "assignments" &&
          renderProtectedTab("assignments", "Academic Assignment Helper", <AssignmentsTracker />)}
        {(activeTab === "planner" || activeTab === "timetable") && <TimetablePlanner />}
        {activeTab === "notices" && <DepartmentNotices />}
        {activeTab === "profile" && (
          <StudentProfile
            onNavigateTab={(tab) => setActiveTab(tab)}
            onOpenReader={handleOpenReader}
          />
        )}
        {activeTab === "student-desk" && <StudentDeskHub />}
        {activeTab === "community-forum" && <CommunityForumHub />}
        {activeTab === "membership" && (
          <MembershipUpgradeSection onUpgradeSuccess={() => setActiveTab("overview")} />
        )}
      </DashboardLayout>
    </>
  );
}
