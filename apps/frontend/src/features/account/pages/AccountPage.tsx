import { useAuthStore } from '@/features/auth/stores/auth';
import AvatarUploader from '../components/AvatarUploader';
import ProfileForm from '../components/ProfileForm';
import PasswordForm from '../components/PasswordForm';
import FriendsSection from '../components/FriendsSection';
import DeleteAccountSection from '../components/DeleteAccountSection';

export default function AccountPage() {
  const user = useAuthStore((state) => state.user);

  if (user === null) {
    return <p className="page py-8 text-center text-ink-soft">Loading your account…</p>;
  }

  return (
    <div className="page flex flex-col gap-8">
      <header>
        <h1 className="text-[clamp(2rem,4vw,2.8rem)]">Your account</h1>
        <p className="mt-1.5 text-ink-soft">Manage your profile, password, friends, and account.</p>
      </header>

      <div className="mx-auto flex w-[min(560px,100%)] flex-col gap-6">
        <AvatarUploader user={user} />
        <ProfileForm user={user} />
        <PasswordForm />
        <FriendsSection />
        <DeleteAccountSection />
      </div>
    </div>
  );
}
