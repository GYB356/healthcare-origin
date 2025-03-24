# Test Coverage Gaps Report

Generated on: 23/03/2025, 11:21:51 am

## Summary

- Total Source Files: 36
- Files with Tests: 6
- Files without Tests: 30
- Test Coverage: 16.67%

## Files Without Tests

### ./components (7 files)

- Layout.tsx
- LoadingSpinner.tsx
- Navigation.tsx
- NewConversation.tsx
- Notification.tsx
- ProtectedRoute.tsx
- Sidebar.tsx

### ./components/dashboard (6 files)

- AdminDashboard.tsx
- DashboardRouter.tsx
- DoctorDashboard.tsx
- NurseDashboard.tsx
- PatientDashboard.tsx
- StaffDashboard.tsx

### ./components/appointments (3 files)

- AppointmentForm.tsx
- AppointmentModal.tsx
- Calendar.tsx

### ./frontend (2 files)

- jest.setup.js
- suppress-act-warnings.ts

### ./components/billing (2 files)

- InvoiceForm.tsx
- InvoiceList.tsx

### ./components/medical-records (2 files)

- MedicalRecordForm.tsx
- MedicalRecordsList.tsx

### ./src/components/auth (1 files)

- Login.test.js

### ./src/lib (1 files)

- prisma.ts

### ./src/components (1 files)

- ProfileDashboard.test.tsx

### ./frontend/**mocks** (1 files)

- axios.js

### ./components/analytics (1 files)

- AnalyticsDashboard.tsx

### ./components/doctor (1 files)

- Messages.tsx

### ./components/patient (1 files)

- Messages.tsx

### ./components/scheduling (1 files)

- DoctorSchedule.tsx

## Recommendations

### Priority Areas

Focus on adding tests for these directories first:

- ./components (7 untested files)
- ./components/dashboard (6 untested files)
- ./components/appointments (3 untested files)

### Specific Recommendations

Start by adding tests for these important files:

- ./components/dashboard/DashboardRouter.tsx
- ./components/ProtectedRoute.tsx
