import axios from "axios";
import apiEndpoins from "../api.endpoin";

const api = axios.create({
  baseURL: "https://sevenedu.store",
  timeout: 1000 * 60 * 50,
  headers: {
    "Content-Type": "multipart/form-data",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) =>
    Promise.reject(err.response?.data?.message || err.message || "Xatolik")
);

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

export const getLessons = (id: string) => {
  const res = api.get(apiEndpoins.getCategory(id));
  return res;
};
export const addLesson = (id: string, formData: FormData) => {
  return api.post(apiEndpoins.addLesson(id), formData);
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
