import axios from "axios";
import apiEndpoins from "../api.endpoin";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://api.sevenedu.org";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 1000 * 60 * 50,
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  if (config.data instanceof FormData) {
    config.headers["Content-Type"] = "multipart/form-data";
  } else if (!config.headers["Content-Type"]) {
    config.headers["Content-Type"] = "application/json";
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (typeof window !== "undefined" && err?.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(
      err.response?.data?.message || err.message || "Xatolik"
    );
  }
);

export const adminLogin = async (email: string, password: string) => {
  const res = await api.post("/auth/admin/login", { email, password });
  return res.data as {
    success: boolean;
    token: string;
    user: {
      id: string;
      name: string;
      surname: string;
      email: string;
      role: string;
      permissions: string[];
      isAuthenticated: boolean;
    };
  };
};

export const verifyAdminToken = async () => {
  const res = await api.get("/admin/me");
  return res.data;
};

// Darslarni ikki dars orasiga (yoki boshiga) qo'shish.
// afterLessonId: null => boshiga; lessonId => shu darsdan keyin.
export const insertLessons = (
  courseId: string,
  afterLessonId: string | null,
  lessons: {
    title: string;
    videoUrl: string;
    isDemo: boolean;
    level?: string;
  }[],
) => {
  return api.post(`/courses/${courseId}/lessons/insert`, {
    afterLessonId,
    lessons,
  });
};

// ── Xodimlar (staff) — faqat OWNER ─────────────────────────
export interface StaffUser {
  id: string;
  name: string;
  surname?: string | null;
  email: string;
  role: "OWNER" | "STAFF";
  permissions: string[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PermissionResource {
  key: string;
  label: string;
  actions: ("view" | "create" | "edit" | "delete")[];
}

export const getPermissionsCatalog = async (): Promise<PermissionResource[]> => {
  const res = await api.get("/staff/permissions-catalog");
  return res.data;
};

export const getStaff = async (): Promise<StaffUser[]> => {
  const res = await api.get("/staff");
  return res.data;
};

export const createStaff = async (data: {
  name: string;
  surname?: string;
  email: string;
  password: string;
  role?: "OWNER" | "STAFF";
  permissions?: string[];
}): Promise<StaffUser> => {
  const res = await api.post("/staff", data);
  return res.data;
};

export const updateStaff = async (
  id: string,
  data: Partial<{
    name: string;
    surname: string;
    role: "OWNER" | "STAFF";
    permissions: string[];
    isActive: boolean;
  }>,
): Promise<StaffUser> => {
  const res = await api.patch(`/staff/${id}`, data);
  return res.data;
};

export const updateStaffPassword = async (id: string, password: string) => {
  const res = await api.patch(`/staff/${id}/password`, { password });
  return res.data;
};

export const deleteStaff = async (id: string) => {
  const res = await api.delete(`/staff/${id}`);
  return res.data;
};

export const getAdminStats = async () => {
  const res = await api.get("/admin/stats");
  return res.data;
};

export const getAllUser = async () => {
  const res = await api.get(apiEndpoins.getUsers);
  return res.data;
};

export const allCourse = async () => {
  const res = await api.get(apiEndpoins.allCourse);
  return res;
};

export const createCategory = (data: FormData) => {
  return api.post(apiEndpoins.createCategor, data);
};

export const getUserByEmail = async (email: string) => {
  const res = await api.get(`/user/by-email?email=${email}`);
  return res;
};

export const deleteCategory = async (id: string) => {
  return api.delete(apiEndpoins.deleteCategory(id));
};

export const updateCategory = (id: string, data: FormData) => {
  return api.patch(apiEndpoins.getCategory(id), data);
};

// ── Shop / Do'kon ────────────────────────────────────────────────
export const allProducts = async () => {
  const res = await api.get(apiEndpoins.allProducts);
  return res;
};

export const createProduct = (data: FormData) => {
  return api.post(apiEndpoins.createProduct, data);
};

export const updateProduct = (id: string, data: FormData) => {
  return api.patch(apiEndpoins.updateProduct(id), data);
};

export const deleteProduct = async (id: string) => {
  return api.delete(apiEndpoins.deleteProduct(id));
};

// ── Movies / Kinolar ─────────────────────────────────────────────
export const moviesByCourse = async (courseId: string) => {
  const res = await api.get(apiEndpoins.moviesByCourse(courseId));
  return res;
};

export const createMovie = (data: FormData) => {
  return api.post(apiEndpoins.createMovie, data);
};

export const updateMovie = (id: string, data: FormData) => {
  return api.patch(apiEndpoins.updateMovie(id), data);
};

export const deleteMovie = async (id: string) => {
  return api.delete(apiEndpoins.deleteMovie(id));
};

export const getLessons = (id: string) => {
  const res = api.get(apiEndpoins.getCategory(id));
  return res;
};

// ── CEFR daraja (modul) nomlari ────────────────────────────
export const getCourseLevels = (id: string) => api.get(`/courses/${id}/levels`);

export const upsertCourseLevel = (
  id: string,
  data: { level: string; title: string; description?: string; order?: number }
) => api.put(`/courses/${id}/levels`, data);

export const deleteCourseLevel = (id: string, level: string) =>
  api.delete(`/courses/${id}/levels/${level}`);
export const addLesson = (id: string, formData: FormData) => {
  return api.post(apiEndpoins.addLesson(id), formData);
};

// ── Vimeo to'g'ridan-to'g'ri (brauzerdan) yuklash ────────────────
// Server Vimeo'da bo'sh video ochib, tus upload endpoint qaytaradi.
// Faylning o'zi server orqali o'tmaydi — brauzer to'g'ridan Vimeo'ga yuklaydi.
export interface VimeoUploadTicket {
  vimeoId: string;
  uploadLink: string; // tus PATCH endpoint
  videoLink: string; // lesson.videoUrl sifatida saqlanadi
}

export const createVimeoUploadTicket = async (
  size: number,
  name?: string
): Promise<VimeoUploadTicket> => {
  const res = await api.post("/courses/vimeo/upload-ticket", { size, name });
  return res.data as VimeoUploadTicket;
};

export const deleteLesson = (id: string) => {
  return api.patch(`/courses/lesson/${id}`);
};

export const updateLesson = (id: string, formData: FormData) => {
  return api.patch(apiEndpoins.updateLesson(id), formData);
};

export const GetCourseById = async (id: string) => {
  try {
    const res = await api.get(apiEndpoins.getCategory(id));
    return res;
  } catch (error) {
    console.log(error);
  }
};

// api.service.ts fayliga getUserById funksiyasini to'g'rilaymiz
export const getUserById = async (userId: string) => {
  try {
    const res = await api.get(`/user/${userId}`);
    return res.data;
  } catch (error) {
    console.log("getUserById xatosi:", error);
    throw error;
  }
};

// O'quvchi profil rasmini (pfp) yangilash — fayl VPS'ga yuklanadi.
// FormData maydoni nomi serverdagi FileInterceptor('profilePic') bilan mos bo'lishi shart.
export const updateUserProfilePic = async (userId: string, file: File) => {
  const formData = new FormData();
  formData.append("profilePic", file);
  const res = await api.post(apiEndpoins.updateProfilePic(userId), formData);
  return res.data;
};

export const deleteUserProfilePic = async (userId: string) => {
  const res = await api.delete(apiEndpoins.deleteProfilePic(userId));
  return res.data;
};

export const addMemeberToCourse = async (
  email: string,
  courseId: string,
  subscription: "FULL_CHARGE" | "MONTHLY"
) => {
  try {
    const res = await api.post(
      "/user/assign-course",
      {
        email,
        courseId,
        subscription,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return res.data;
  } catch (error) {
    console.log("addMemeberToCourse xatosi:", error);
    throw error;
  }
};
interface QuizData {
  question: string;
  options: string[];
  correctAnswer: string;
}

export const createQuiz = async (lessonId: string, data: QuizData) => {
  return await api.post(`/quizs/${lessonId}/create`, data, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
};

export default api;
