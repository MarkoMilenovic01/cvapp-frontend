import { useEffect, useState } from "react";
import { ApiError } from "../api/apiClient";
import * as companyApi from "../api/companyApi";
import type { CompanyRequest, CompanyResponse } from "../types/company";

const emptyCompanyProfile: CompanyRequest = {
  name: "",
  description: "",
  website: "",
  industry: "",
};

export default function CompanyProfileSection() {
  const [profile, setProfile] = useState<CompanyResponse | null>(null);
  const [form, setForm] = useState<CompanyRequest>(emptyCompanyProfile);

  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      setLoading(true);
      setError("");

      const response = await companyApi.getMyCompanyProfile();

      setProfile(response);
      setForm({
        name: response.name ?? "",
        description: response.description ?? "",
        website: response.website ?? "",
        industry: response.industry ?? "",
      });
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Something went wrong while loading company profile");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    try {
      setMessage("");
      setError("");

      const response = await companyApi.updateMyCompanyProfile(form);

      setProfile(response);
      setMessage("Company profile updated successfully.");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Something went wrong while updating company profile");
      }
    }
  }

  async function handleUploadPhoto() {
    if (!photoFile) return;

    try {
      setMessage("");
      setError("");

      await companyApi.uploadCompanyPhoto(photoFile);

      setPhotoFile(null);
      setMessage("Company photo uploaded successfully.");

      await loadProfile();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Something went wrong while uploading company photo");
      }
    }
  }

  async function handleDeletePhoto() {
    try {
      setMessage("");
      setError("");

      await companyApi.deleteCompanyPhoto();

      setMessage("Company photo deleted successfully.");

      await loadProfile();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Something went wrong while deleting company photo");
      }
    }
  }

  if (loading) {
    return <p>Loading company profile...</p>;
  }

  return (
    <section>
      <h2>Company Profile</h2>

      {message && <p>{message}</p>}
      {error && <p>{error}</p>}

      {profile?.photoUrl && (
        <div>
          <img
            src={profile.photoUrl}
            alt={profile.name}
            width={140}
            height={140}
          />

          <br />

          <button type="button" onClick={handleDeletePhoto}>
            Delete photo
          </button>
        </div>
      )}

      <hr />

      <div>
        <label>Company name</label>
        <input
          value={form.name}
          onChange={(event) =>
            setForm({ ...form, name: event.target.value })
          }
        />
      </div>

      <div>
        <label>Description</label>
        <textarea
          value={form.description}
          onChange={(event) =>
            setForm({ ...form, description: event.target.value })
          }
        />
      </div>

      <div>
        <label>Website</label>
        <input
          value={form.website}
          placeholder="https://example.com"
          onChange={(event) =>
            setForm({ ...form, website: event.target.value })
          }
        />
      </div>

      <div>
        <label>Industry</label>
        <input
          value={form.industry}
          placeholder="Software, Finance, Healthcare..."
          onChange={(event) =>
            setForm({ ...form, industry: event.target.value })
          }
        />
      </div>

      <button type="button" onClick={handleSave}>
        Save profile
      </button>

      <hr />

      <h3>Company photo</h3>

      <input
        type="file"
        accept="image/*"
        onChange={(event) => setPhotoFile(event.target.files?.[0] ?? null)}
      />

      <button type="button" onClick={handleUploadPhoto} disabled={!photoFile}>
        Upload photo
      </button>
    </section>
  );
}