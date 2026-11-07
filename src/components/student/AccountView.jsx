import { Info } from "lucide-react";
import PasswordCard from "../PasswordCard";

export default function AccountView() {
  return (
    <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-6 items-start">
      <PasswordCard minLength={6} />
      <div className="lb-card p-5 sm:p-6 flex items-start gap-3">
        <div className="lb-iconsoft"><Info size={16} /></div>
        <div>
          <h4 className="font-semibold lb-heading mb-1">Forgot your password?</h4>
          <p className="text-sm lb-muted">Please contact the library desk. The librarian can set a new password for you and tell you. After that you can change it here to one of your own.</p>
          <p className="text-sm lb-muted mt-3">You can change your profile picture from the My Profile page. Your name, phone and email can only be corrected by the librarian.</p>
        </div>
      </div>
    </div>
  );
}
