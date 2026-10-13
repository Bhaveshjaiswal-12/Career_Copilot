import { useState } from 'react';
import { toast } from 'sonner';
import {
  Lock,
  KeyRound,
  Trash2,
  Download,
  ShieldAlert,
  Database,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../services/api.js';
import { PageHeader } from '../components/PageHeader.jsx';
import { Card } from '../components/Card.jsx';
import { Button } from '../components/Button.jsx';
import { Modal } from '../components/Modal.jsx';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      toast.error('New passwords do not match.');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters.');
      return;
    }

    setPasswordLoading(true);
    try {
      await api.put('/auth/change-password', passwordData);
      toast.success('Password updated successfully.');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleExportData = async () => {
    setExportLoading(true);
    try {
      const res = await api.get('/auth/export-data', { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `career-copilot-data-${user?.username || 'user'}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Personal data export downloaded.');
    } catch (err) {
      toast.error('Failed to export data.');
    } finally {
      setExportLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE') {
      toast.error('Please type DELETE to confirm account deletion.');
      return;
    }

    setDeleteLoading(true);
    try {
      await api.delete('/auth/account');
      toast.success('Your account and all associated data have been deleted.');
      logout();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete account.');
      setDeleteLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title="Settings & Privacy"
        description="Manage your authentication credentials, data export, and account retention controls."
        breadcrumbs={[
          { label: 'Dashboard', to: '/dashboard' },
          { label: 'Settings' },
        ]}
      />

      {/* Account Identity Overview */}
      <Card className="p-6 border-[#E7E1F1] bg-[#FFFFFF] shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#F2EDFC] border border-[#DDD0FF] flex items-center justify-center text-[#6845C5] font-extrabold text-lg shrink-0 shadow-xs">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div>
            <h2 className="text-base font-bold text-[#26213A]">{user?.name}</h2>
            <p className="text-xs text-[#716B85] mt-0.5">
              Username: <strong className="text-[#49316F] font-semibold">@{user?.username}</strong> • Email:{' '}
              <strong className="text-[#49316F] font-semibold">{user?.email}</strong>
            </p>
          </div>
        </div>
      </Card>

      {/* Security: Password Management */}
      <Card className="p-6 space-y-5 border-[#E7E1F1] bg-[#FFFFFF] shadow-sm">
        <div className="border-b border-[#E7E1F1] pb-3">
          <h3 className="text-sm font-bold text-[#26213A] flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-[#6845C5]" />
            Security & Password Update
          </h3>
          <p className="text-xs text-[#716B85] mt-0.5">
            Update your account password. Requires your current password for verification.
          </p>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-semibold text-[#26213A] mb-1.5">
              Current Password
            </label>
            <input
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) =>
                setPasswordData({ ...passwordData, currentPassword: e.target.value })
              }
              required
              className="w-full bg-[#FFFFFF] border border-[#E7E1F1] rounded-xl px-3.5 py-2.5 text-sm text-[#26213A] placeholder-[#918BA2] focus:outline-none focus:border-[#6845C5] focus:ring-2 focus:ring-[#9C83EC]/20 transition-all shadow-xs"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#26213A] mb-1.5">
              New Password <span className="text-[#918BA2]">(Min 6 characters)</span>
            </label>
            <input
              type="password"
              value={passwordData.newPassword}
              onChange={(e) =>
                setPasswordData({ ...passwordData, newPassword: e.target.value })
              }
              required
              minLength={6}
              className="w-full bg-[#FFFFFF] border border-[#E7E1F1] rounded-xl px-3.5 py-2.5 text-sm text-[#26213A] placeholder-[#918BA2] focus:outline-none focus:border-[#6845C5] focus:ring-2 focus:ring-[#9C83EC]/20 transition-all shadow-xs"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#26213A] mb-1.5">
              Confirm New Password
            </label>
            <input
              type="password"
              value={passwordData.confirmNewPassword}
              onChange={(e) =>
                setPasswordData({ ...passwordData, confirmNewPassword: e.target.value })
              }
              required
              className="w-full bg-[#FFFFFF] border border-[#E7E1F1] rounded-xl px-3.5 py-2.5 text-sm text-[#26213A] placeholder-[#918BA2] focus:outline-none focus:border-[#6845C5] focus:ring-2 focus:ring-[#9C83EC]/20 transition-all shadow-xs"
              placeholder="••••••••"
            />
          </div>

          <Button type="submit" variant="primary" loading={passwordLoading}>
            <Lock className="w-3.5 h-3.5 mr-1.5" />
            Update Password
          </Button>
        </form>
      </Card>

      {/* Data Export & Privacy Portability */}
      <Card className="p-6 space-y-4 border-[#E7E1F1] bg-[#FFFFFF] shadow-sm">
        <div className="border-b border-[#E7E1F1] pb-3">
          <h3 className="text-sm font-bold text-[#26213A] flex items-center gap-2">
            <Database className="w-4 h-4 text-[#6845C5]" />
            Data Portability & Export
          </h3>
          <p className="text-xs text-[#716B85] mt-0.5">
            Download a full archive of your saved profile, analysis reports, and bookmarked jobs in standard JSON format.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-xs text-[#716B85] leading-relaxed max-w-lg">
            Your export contains your candidate profile attributes, skill gap records, generated interview question banks, and shortlisted jobs.
          </p>

          <Button
            variant="secondary"
            onClick={handleExportData}
            loading={exportLoading}
            className="shrink-0"
          >
            <Download className="w-3.5 h-3.5 mr-1.5 text-[#6845C5]" />
            Export My Data (JSON)
          </Button>
        </div>
      </Card>

      {/* Danger Zone: Account Deletion */}
      <Card className="p-6 space-y-4 border-[#B83A52]/20 bg-[#FFFFFF] shadow-sm">
        <div className="border-b border-[#E7E1F1] pb-3">
          <h3 className="text-sm font-bold text-[#B83A52] flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-[#B83A52]" />
            Danger Zone
          </h3>
          <p className="text-xs text-[#716B85] mt-0.5">
            Irreversible actions regarding your account and stored records.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <div className="text-sm font-bold text-[#26213A]">
              Delete Account & Stored Data
            </div>
            <p className="text-xs text-[#716B85] max-w-md">
              Permanently erases your user profile, all generated interview analysis reports, tailored resumes, and saved job listings.
            </p>
          </div>

          <Button
            variant="secondary"
            onClick={() => setShowDeleteModal(true)}
            className="shrink-0 text-[#B83A52] border-[#B83A52]/30 hover:bg-[#B83A52]/10"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
            Delete Account
          </Button>
        </div>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeleteConfirmation('');
        }}
        title="Confirm Permanent Account Deletion"
      >
        <div className="space-y-4">
          <p className="text-xs text-[#716B85] leading-relaxed">
            This action is permanent and cannot be undone. All your saved profile data, analysis reports, interview questions, and bookmarked jobs will be deleted immediately.
          </p>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#26213A]">
              To proceed, type <span className="font-mono font-bold text-[#B83A52]">DELETE</span> below:
            </label>
            <input
              type="text"
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              placeholder="DELETE"
              className="w-full bg-[#FFFFFF] border border-[#E7E1F1] rounded-xl px-3.5 py-2 text-sm text-[#26213A] font-mono focus:outline-none focus:border-[#B83A52] text-center shadow-xs"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <Button
              variant="secondary"
              onClick={() => {
                setShowDeleteModal(false);
                setDeleteConfirmation('');
              }}
              disabled={deleteLoading}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleDeleteAccount}
              disabled={deleteConfirmation !== 'DELETE' || deleteLoading}
              loading={deleteLoading}
            >
              Permanently Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
