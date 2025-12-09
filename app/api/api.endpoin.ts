const main_url = {
  auth: "auth",
  course: "courses",
  quiz: "quizs",
  quession: "quessions",
  user: "user",
};

const apiEndpoins = {
  // Home
  home: "/",

  // register
  registerUser: `${main_url.auth}/register`,
  verifyCode: `${main_url.auth}/verify`,
  loginUser: `${main_url.auth}/login`,
  decodeToken: `${main_url.auth}/verify-token`,

  // create course
  allCourse: `${main_url.course}/all`,
  createCategor: `${main_url.course}/create`,
  addLesson: (id: string) => `${main_url.course}/category/${id}/lesson`,
  getCategory: (id: string) => `${main_url.course}/category/${id}`,
  deleteLesson: (id: string) => `${main_url.course}/lesson/${id}`,
  deleteCategory: (id: string) => `${main_url.course}/${id}`,
  updateLesson: (id: string) => `${main_url.course}/lessons/${id}`,

  // create quiz
  oneQuiz: (id: string) => `${main_url.quiz}/${id}`,
  createQuiz: (id: string) => `${main_url.quiz}/${id}/new-quiz`,
  editQuiz: (id: string, quizid: string) => `${main_url.quiz}/${id}/${quizid}`,
  deleteQuiz: (id: string) => `${main_url.quiz}/${id}`,

  // quessions
  createQuession: (id: string) => `${main_url.quession}/${id}/create`,
  eidtQuessions: (id: string) => `${main_url.quession}/${id}`,
  deleteQuessions: (id: string) => `${main_url.quession}/${id}`,

  // user
  getMe: `${main_url.user}/me`,
  getUsers: `${main_url.user}/all`,
  getOneUser: (id: string) => `${main_url.user}/${id}`,
  deleteUser: (id: number) => `${main_url.user}/delete/${id}`,
  changeUserDetails: (id: number) => `${main_url.user}/update/${id}`,
};

export default apiEndpoins;
