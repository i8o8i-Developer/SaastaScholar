import React, { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/Hooks/UseAuth";
import { DashboardLayout } from "./DashboardLayout";
import { DashboardOverview } from "./DashboardOverview";
import { NotesHub } from "./NotesHub";
import { PyqsHub } from "./PyqsHub";
import { FacultyHub } from "./FacultyHub";
import { LabsHub } from "./LabsHub";
import { AssignmentsTracker } from "./AssignmentsTracker";
import { TimetablePlanner } from "./TimetablePlanner";
import { StudentProfile } from "./StudentProfile";
import { DepartmentNotices } from "./DepartmentNotices";
import { DrmSecureReader } from "./DrmSecureReader";
import { StudentDeskHub } from "./StudentDeskHub";
import { CommunityForumHub } from "./CommunityForumHub";

export function UserDashboard() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth();
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

  return (
    <DashboardLayout
      activeTab={activeTab}
      onSelectTab={(tab) => {
        setActiveTab(tab);
        setReadingMaterialId(null);
      }}
      onOpenReader={handleOpenReader}
    >
      {readingMaterialId ? (
        <DrmSecureReader
          materialId={readingMaterialId}
          onClose={handleCloseReader}
        />
      ) : (
        <>
          {activeTab === "overview" && (
            <DashboardOverview
              onNavigateTab={(tab) => setActiveTab(tab)}
              onOpenReader={handleOpenReader}
            />
          )}
          {activeTab === "notes" && (
            <NotesHub onOpenReader={handleOpenReader} />
          )}
          {activeTab === "pyqs" && (
            <PyqsHub onOpenReader={handleOpenReader} />
          )}
          {activeTab === "faculty" && (
            <FacultyHub onOpenReader={handleOpenReader} />
          )}
          {activeTab === "labs" && (
            <LabsHub />
          )}
          {activeTab === "assignments" && (
            <AssignmentsTracker />
          )}
          {activeTab === "planner" && (
            <TimetablePlanner />
          )}
          {activeTab === "notices" && (
            <DepartmentNotices />
          )}
          {activeTab === "profile" && (
            <StudentProfile />
          )}
          {activeTab === "student-desk" && (
            <StudentDeskHub />
          )}
          {activeTab === "community-forum" && (
            <CommunityForumHub />
          )}
        </>
      )}
    </DashboardLayout>
  );
}
