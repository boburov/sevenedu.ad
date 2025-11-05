'use client';

import { useEffect, useState } from 'react';
import { getAllUser, GetCourseById } from '@/app/api/service/api';
import { Eye, Search, ExternalLink } from 'lucide-react';
import { Dialog } from '@headlessui/react';
import Link from 'next/link';

interface Notification {
  notification: {
    title: string;
    message: string;
    createdAt: string;
    courseId: string | null;
  };
}

interface Course {
  courseId: string;
  isFinished: boolean;
}

interface LessonProgress {
  lessonId: string;
  watchedAt: string;
}

interface User {
  id: string;
  email: string;
  name?: string;
  coins?: number;
  isVerified?: boolean;
  courses: Course[];
  showedLesson: LessonProgress[];
  notifications: Notification[];
}

interface CourseDetails {
  id: string;
  title: string;
  description?: string;
}

const UserDashboard = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [open, setOpen] = useState(false);
  const [userCourses, setUserCourses] = useState<CourseDetails[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    getAllUser()
      .then((userRes) => {
        setUsers(userRes);
        setFilteredUsers(userRes);
      })
      .finally(() => setLoading(false));
  }, []);

  // Search filter
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

  const openModal = async (user: User) => {
    setSelectedUser(user);
    setOpen(true);

    if (user.courses?.length) {
      const courseDetails = await Promise.all(
        user.courses.map((c) => GetCourseById(c.courseId))
      );
      setUserCourses(courseDetails.map((res) => res?.data).filter(Boolean));
    } else {
      setUserCourses([]);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('uz-UZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e1e2f] to-[#15161d] text-white p-8">
      <h1 className="text-3xl font-bold text-green-400 mb-8 text-center tracking-wide">
        👤 Foydalanuvchi Paneli
      </h1>

      {/* Search Input */}
      <div className="max-w-md mx-auto mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Email, ism yoki ID bo'yicha qidirish..."
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-600 bg-[#1c1c2c] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <p className="text-center text-gray-400">Yuklanmoqda...</p>
      ) : (
        <>
          {filteredUsers.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              <p>Foydalanuvchi topilmadi</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="bg-[#1c1c2c] rounded-xl p-5 border border-gray-700 shadow-lg hover:shadow-green-600 transition hover:border-green-500"
                >
                  <h2 className="text-xl font-semibold mb-1 truncate">{user.name || 'Ism mavjud emas'}</h2>
                  <p className="text-gray-300 text-sm mb-1 truncate">{user.email}</p>
                  <p className="text-sm mb-1">
                    <span className={`px-2 py-1 rounded-full text-xs ${user.isVerified ? 'bg-green-500' : 'bg-yellow-500'}`}>
                      {user.isVerified ? '✅ Tasdiqlangan' : '⏳ Tasdiqlanmagan'}
                    </span>
                  </p>
                  <div className="flex justify-between items-center mt-4">
                    <div className="text-sm text-gray-400">
                      <p>💰 {user.coins ?? 0} tanga</p>
                      <p>🎓 {user.courses?.length ?? 0} kurs</p>
                    </div>
                    <button
                      onClick={() => openModal(user)}
                      className="flex items-center gap-2 text-sm bg-green-600 hover:bg-green-700 px-3 py-2 rounded-md text-white font-medium transition-colors"
                    >
                      <Eye className="w-4 h-4" /> Ko&apos;rish
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Modal */}
      <Dialog open={open} onClose={() => setOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-[#1a1a2a] text-white p-6 rounded-xl w-full max-w-2xl border border-gray-700 shadow-xl max-h-[90vh] overflow-y-auto">
            {selectedUser && (
              <>
                <Dialog.Title className="text-xl font-bold mb-6 text-green-400 border-b border-gray-700 pb-4">
                  👤 {selectedUser.name || 'Ism mavjud emas'} - Batafsil ma&apos;lumot
                </Dialog.Title>
                
                <div className="space-y-6">
                  {/* Asosiy ma'lumotlar */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-[#252535] p-4 rounded-lg">
                      <h4 className="font-semibold text-green-400 mb-2">👤 Shaxsiy ma&apos;lumotlar</h4>
                      <p className="text-sm mb-1"><strong>ID:</strong> {selectedUser.id}</p>
                      <p className="text-sm mb-1"><strong>Email:</strong> {selectedUser.email}</p>
                      <p className="text-sm mb-1"><strong>Ism:</strong> {selectedUser.name || 'Mavjud emas'}</p>
                      <p className="text-sm">
                        <strong>Holat:</strong> 
                        <span className={`ml-2 px-2 py-1 rounded-full text-xs ${selectedUser.isVerified ? 'bg-green-500' : 'bg-yellow-500'}`}>
                          {selectedUser.isVerified ? 'Tasdiqlangan' : 'Tasdiqlanmagan'}
                        </span>
                      </p>
                    </div>

                    <div className="bg-[#252535] p-4 rounded-lg">
                      <h4 className="font-semibold text-green-400 mb-2">💰 Moliyaviy ma&apos;lumotlar</h4>
                      <p className="text-lg font-bold text-yellow-400 mb-2">{selectedUser.coins ?? 0} tanga</p>
                      <p className="text-sm"><strong>Kurslar soni:</strong> {selectedUser.courses?.length ?? 0}</p>
                      <p className="text-sm"><strong>Ko&apos;rilgan darslar:</strong> {selectedUser.showedLesson?.length ?? 0}</p>
                    </div>
                  </div>

                  {/* Kurslar */}
                  <div className="bg-[#252535] p-4 rounded-lg">
                    <h4 className="font-semibold text-green-400 mb-3">🎓 Sotib olingan kurslar</h4>
                    {userCourses.length > 0 ? (
                      <div className="space-y-2">
                        {userCourses.map((course, idx) => (
                          <div key={idx} className="flex justify-between items-center p-3 bg-[#1a1a2a] rounded border border-gray-600">
                            <div>
                              <p className="font-medium">{course?.title || 'Noma&apos;lum kurs'}</p>
                              {course?.description && (
                                <p className="text-sm text-gray-400 mt-1">{course.description}</p>
                              )}
                            </div>
                            <span className={`px-2 py-1 rounded text-xs ${selectedUser.courses[idx]?.isFinished ? 'bg-green-500' : 'bg-blue-500'}`}>
                              {selectedUser.courses[idx]?.isFinished ? 'Tugatilgan' : 'Davom etayapti'}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-400 text-sm">Kurslar mavjud emas.</p>
                    )}
                  </div>

                  {/* Ko&apos;rilgan darslar */}
                  {selectedUser.showedLesson?.length > 0 && (
                    <div className="bg-[#252535] p-4 rounded-lg">
                      <h4 className="font-semibold text-green-400 mb-3">📺 So&apos;ngi ko&apos;rilgan darslar</h4>
                      <div className="space-y-2">
                        {selectedUser.showedLesson.slice(0, 5).map((lesson, idx) => (
                          <div key={idx} className="flex justify-between items-center p-2 bg-[#1a1a2a] rounded text-sm">
                            <span>Dars ID: {lesson.lessonId}</span>
                            <span className="text-gray-400">{formatDate(lesson.watchedAt)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t border-gray-700">
                    <Link
                      href={`/users/${selectedUser.id}`}
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white font-medium transition-colors flex-1 justify-center"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Profilni ochish
                    </Link>
                    <button
                      onClick={() => setOpen(false)}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg font-medium transition-colors"
                    >
                      Yopish
                    </button>
                  </div>
                </div>
              </>
            )}
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
};

export default UserDashboard;