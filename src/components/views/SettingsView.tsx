import { Settings as SettingsIcon, Shield, Bell, Palette, LogOut, UserPlus, X } from "lucide-react";
import { HARDCODED_ADMINS } from "../../App";
import { useState } from "react";
import { collection, addDoc, deleteDoc, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase";

interface SettingsViewProps {
  isAdmin?: boolean;
  currentUserEmail?: string | null;
  extraAdmins?: string[];
  onLogout?: () => void;
}

export function SettingsView({ isAdmin, currentUserEmail, extraAdmins = [], onLogout }: SettingsViewProps) {
  const [inviteEmail, setInviteEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);

  const handleInvite = async () => {
    if (!inviteEmail || !inviteEmail.includes("@")) return;
    if (HARDCODED_ADMINS.includes(inviteEmail.toLowerCase()) || extraAdmins.includes(inviteEmail.toLowerCase())) {
      alert("This user is already an admin!");
      return;
    }
    
    setIsInviting(true);
    try {
      await addDoc(collection(db, "admins"), {
        email: inviteEmail.toLowerCase(),
        invitedBy: currentUserEmail,
        createdAt: new Date().toISOString()
      });
      setInviteEmail("");
    } catch (e) {
      console.error("Failed to invite admin", e);
      alert("Failed to invite admin.");
    } finally {
      setIsInviting(false);
    }
  };

  const handleRevoke = async (email: string) => {
    if (!confirm(`Are you sure you want to revoke admin access for ${email}?`)) return;
    try {
      const q = query(collection(db, "admins"), where("email", "==", email));
      const snapshot = await getDocs(q);
      snapshot.forEach(async (docSnap) => {
        await deleteDoc(docSnap.ref);
      });
    } catch (e) {
      console.error("Failed to revoke admin", e);
    }
  };
  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-start">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Application Settings</h2>
            <p className="text-sm text-gray-500 mt-1">Manage your team preferences and application defaults.</p>
          </div>
          {currentUserEmail && (
            <div className="flex items-center gap-4 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
              <div className="flex flex-col text-right">
                <span className="text-sm font-bold text-gray-900">{currentUserEmail}</span>
                <span className="text-xs text-gray-500 uppercase font-semibold">{isAdmin ? "Admin" : "Viewer"}</span>
              </div>
              <div className="w-px h-8 bg-gray-200 mx-2" />
              <button 
                onClick={onLogout}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Log out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
        
        <div className="p-8 space-y-8">
          
          {/* Admin Section */}
          {isAdmin && (
            <>
              <div className="flex items-start gap-6">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                  <Shield className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-900">Team Admins</h3>
                  <p className="text-sm text-gray-500 mb-4">Admins can edit records and invite other admins.</p>
                  
                  <div className="space-y-2 mb-4">
                    {HARDCODED_ADMINS.map(email => (
                      <div key={email} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-100 rounded-lg">
                        <span className="text-sm font-medium text-gray-700">{email}</span>
                        <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold">Owner</span>
                      </div>
                    ))}
                    
                    {extraAdmins.map(email => (
                      <div key={email} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg group">
                        <span className="text-sm font-medium text-gray-700">{email}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-bold">Admin</span>
                          <button 
                            onClick={() => handleRevoke(email)}
                            className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-all"
                            title="Revoke Admin Access"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 mt-4">
                    <input 
                      type="email" 
                      value={inviteEmail}
                      onChange={e => setInviteEmail(e.target.value)}
                      placeholder="Invite new admin by email..." 
                      className="flex-1 h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <button 
                      onClick={handleInvite}
                      disabled={isInviting || !inviteEmail}
                      className="h-10 px-4 bg-gray-900 text-white text-sm font-medium rounded-lg flex items-center gap-2 hover:bg-gray-800 transition-colors disabled:opacity-50"
                    >
                      <UserPlus className="w-4 h-4" /> {isInviting ? "Inviting..." : "Invite"}
                    </button>
                  </div>
                </div>
              </div>
              <hr className="border-gray-100" />
            </>
          )}

          {/* Section 1 */}
          <div className="flex items-start gap-6">
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
              <Palette className="w-5 h-5 text-gray-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-900">Appearance</h3>
              <p className="text-sm text-gray-500 mb-4">Customize how the application looks on your device.</p>
              
              <div className="flex items-center gap-4">
                <button className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg shadow-sm border border-transparent">
                  Dark Mode
                </button>
                <button className="px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-lg shadow-sm border border-gray-200">
                  Light Mode
                </button>
                <button className="px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-lg shadow-sm border border-gray-200">
                  System
                </button>
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Section 2 */}
          <div className="flex items-start gap-6">
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5 text-gray-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
              <p className="text-sm text-gray-500 mb-4">Manage when and how you receive alerts.</p>
              
              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input type="checkbox" className="w-4 h-4 rounded text-primary focus:ring-primary border-gray-300" defaultChecked />
                  <span className="text-sm text-gray-700 font-medium">Email notifications for new duplicate conflicts</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" className="w-4 h-4 rounded text-primary focus:ring-primary border-gray-300" defaultChecked />
                  <span className="text-sm text-gray-700 font-medium">Weekly summary reports</span>
                </label>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
