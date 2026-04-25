import { ensureProfile } from "@/lib/data";
import { updateProfile } from "@/app/admin/actions";
import { ImageUploadField } from "@/components/ImageUploadField";
import { ResumeUploadField } from "@/components/ResumeUploadField";
import { requireSession } from "@/lib/auth";

export default async function AdminProfilePage() {
  const session = await requireSession();
  const profile = await ensureProfile(session.sub, session.username);

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-white">Profile</h1>
      <p className="mt-1 text-sm text-slate-400">
        This appears in the hero and contact area on your public site.
      </p>

      <form action={updateProfile} className="mt-8 space-y-6">
        <ImageUploadField
          fieldName="profileImage"
          label="Profile photo"
          initialUrl={profile.profileImage}
        />
        <ResumeUploadField
          fieldName="resumeUrl"
          label="Resume / CV PDF"
          initialUrl={profile.resumeUrl}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="text-sm text-slate-300">Display name</span>
            <input
              name="displayName"
              defaultValue={profile.displayName}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none ring-emerald-500/30 focus:ring-2"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-sm text-slate-300">Professional headline</span>
            <input
              name="headline"
              defaultValue={profile.headline}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none ring-emerald-500/30 focus:ring-2"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-sm text-slate-300">Bio</span>
            <textarea
              name="bio"
              rows={5}
              defaultValue={profile.bio}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none ring-emerald-500/30 focus:ring-2"
            />
          </label>
          <label className="block">
            <span className="text-sm text-slate-300">Email</span>
            <input
              name="email"
              type="email"
              defaultValue={profile.email ?? ""}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none ring-emerald-500/30 focus:ring-2"
            />
          </label>
          <label className="block">
            <span className="text-sm text-slate-300">Phone</span>
            <input
              name="phone"
              defaultValue={profile.phone ?? ""}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none ring-emerald-500/30 focus:ring-2"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-sm text-slate-300">Location</span>
            <input
              name="location"
              defaultValue={profile.location ?? ""}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none ring-emerald-500/30 focus:ring-2"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-sm text-slate-300">Personal website</span>
            <input
              name="website"
              defaultValue={profile.website ?? ""}
              placeholder="https://"
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none ring-emerald-500/30 focus:ring-2"
            />
          </label>
          <label className="block">
            <span className="text-sm text-slate-300">Discord URL</span>
            <input
              name="discordUrl"
              defaultValue={profile.discordUrl ?? ""}
              placeholder="https://discord.com/users/..."
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none ring-emerald-500/30 focus:ring-2"
            />
          </label>
          <label className="block">
            <span className="text-sm text-slate-300">X URL</span>
            <input
              name="xUrl"
              defaultValue={profile.xUrl ?? ""}
              placeholder="https://x.com/yourname"
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none ring-emerald-500/30 focus:ring-2"
            />
          </label>
          <label className="block">
            <span className="text-sm text-slate-300">Threads URL</span>
            <input
              name="threadsUrl"
              defaultValue={profile.threadsUrl ?? ""}
              placeholder="https://www.threads.net/@yourname"
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none ring-emerald-500/30 focus:ring-2"
            />
          </label>
          <label className="block">
            <span className="text-sm text-slate-300">Instagram URL</span>
            <input
              name="instagramUrl"
              defaultValue={profile.instagramUrl ?? ""}
              placeholder="https://instagram.com/yourname"
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none ring-emerald-500/30 focus:ring-2"
            />
          </label>
          <label className="block">
            <span className="text-sm text-slate-300">Facebook URL</span>
            <input
              name="facebookUrl"
              defaultValue={profile.facebookUrl ?? ""}
              placeholder="https://facebook.com/yourname"
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none ring-emerald-500/30 focus:ring-2"
            />
          </label>
          <label className="block">
            <span className="text-sm text-slate-300">WhatsApp URL</span>
            <input
              name="whatsappUrl"
              defaultValue={profile.whatsappUrl ?? ""}
              placeholder="https://wa.me/..."
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none ring-emerald-500/30 focus:ring-2"
            />
          </label>
          <label className="block">
            <span className="text-sm text-slate-300">LinkedIn URL</span>
            <input
              name="linkedinUrl"
              defaultValue={profile.linkedinUrl ?? ""}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none ring-emerald-500/30 focus:ring-2"
            />
          </label>
          <label className="block">
            <span className="text-sm text-slate-300">GitHub URL</span>
            <input
              name="githubUrl"
              defaultValue={profile.githubUrl ?? ""}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none ring-emerald-500/30 focus:ring-2"
            />
          </label>
        </div>

        <button
          type="submit"
          className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500"
        >
          Save profile
        </button>
      </form>
    </div>
  );
}
