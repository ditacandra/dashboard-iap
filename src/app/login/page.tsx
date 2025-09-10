"use client";

import { useEffect, useState, Suspense } from "react";
import Papa from "papaparse";
import { useRouter, useSearchParams } from "next/navigation";

export const dynamic = "force-dynamic"; // cegah prerender error

interface User {
  username: string;
  password: string;
  role: string;
  access?: string;
}

function LoginContent() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const provinsiId = searchParams.get("provinsi");

  useEffect(() => {
    Papa.parse("/data/users.csv", {
      download: true,
      header: true,
      delimiter: ";",
      complete: (result: { data: any[] }) => {
        const parsedUsers: User[] = result.data.map((u: any) => ({
          username: (u.username || "").trim(),
          password: (u.password || "").trim(),
          role: (u.role || "user").trim(),
          access: (u.access || "10").trim(),
        }));
        console.log("Loaded users:", parsedUsers);
        setUsers(parsedUsers);
      },
      error: (err: any) => {
        console.error("Error parsing CSV:", err);
        setError("Gagal memuat data user");
      },
    });
  }, []);

  const handleLogin = () => {
    if (users.length === 0) {
      setError("Data user belum dimuat, coba lagi.");
      return;
    }

    const user = users.find(
      (u) => u.username.toLowerCase() === username.trim().toLowerCase()
    );

    if (!user) {
      setError("Username tidak ditemukan");
      return;
    }

    if (user.password !== password.trim()) {
      setError("Password salah");
      return;
    }

    localStorage.setItem("user", JSON.stringify(user));

    // Ambil id provinsi dari URL jika ada, kalau tidak pakai akses user
    const targetProvinsiId = provinsiId || user.access || "10";

    if (targetProvinsiId === "10") {
      router.push("/dashboard");
    } else {
      router.push(`/provinsi/${targetProvinsiId}`);
    }
  };

  return (
    <div
      className="flex justify-center text-black items-center h-screen"
      style={{ backgroundImage: "url('/bg/bg2.jpg')" }}
    >
      <div className="bg-white border border-red-500 shadow-md p-8 rounded-lg w-80">
        <h2 className="text-2xl mb-4 text-center">Login</h2>
        <input
          type="text"
          placeholder="Username"
          className="w-full mb-2 p-2 border rounded"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full mb-2 p-2 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-red-500 mb-2">{error}</p>}
        <button
          className="w-full bg-blue-500 text-white p-2 rounded"
          onClick={handleLogin}
        >
          Login
        </button>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
