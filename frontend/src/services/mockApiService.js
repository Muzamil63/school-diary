/**
 * Mock API service for demo mode.
 * Simulates server responses with realistic delays.
 * Used when VITE_DEMO_MODE=true or backend is unavailable.
 */
import {
  MOCK_USERS,
  MOCK_CLASSES,
  MOCK_SUBJECTS,
  MOCK_DIARY_ENTRIES,
  MOCK_ACTIVITY_LOGS,
  DEMO_CREDENTIALS,
  MOCK_STATS,
} from '../data/mockData';

let diaryEntries = [...MOCK_DIARY_ENTRIES];
let users = [...MOCK_USERS];
let classes = [...MOCK_CLASSES];
let subjects = [...MOCK_SUBJECTS];
let nextDiaryId = diaryEntries.length + 1;
let nextUserId = users.length + 1;

const delay = (ms = 400) => new Promise((res) => setTimeout(res, ms));

const paginate = (data, page = 1, perPage = 10) => {
  const start = (page - 1) * perPage;
  const items = data.slice(start, start + perPage);
  return {
    data: items,
    meta: {
      current_page: page,
      last_page: Math.ceil(data.length / perPage),
      per_page: perPage,
      total: data.length,
    },
  };
};

export const mockAuthService = {
  login: async ({ email, password }) => {
    await delay(600);
    const match = Object.values(DEMO_CREDENTIALS).find(
      (c) => c.email === email && c.password === password
    );
    if (!match) {
      const err = new Error('Invalid credentials');
      err.response = { status: 401, data: { message: 'Invalid credentials' } };
      throw err;
    }
    const token = `demo-token-${match.user.role}-${Date.now()}`;
    localStorage.setItem('demo_user', JSON.stringify(match.user));
    return { data: { token, user: match.user } };
  },

  logout: async () => {
    await delay(200);
    localStorage.removeItem('demo_user');
    return { data: { message: 'Logged out' } };
  },

  getProfile: async () => {
    await delay(300);
    const user = JSON.parse(localStorage.getItem('demo_user') || 'null');
    if (!user) {
      const err = new Error('Unauthenticated');
      err.response = { status: 401, data: { message: 'Unauthenticated' } };
      throw err;
    }
    return { data: user };
  },
};

export const mockDiaryService = {
  getEntries: async (params = {}) => {
    await delay();
    let filtered = [...diaryEntries];
    if (params.type) filtered = filtered.filter((e) => e.type === params.type);
    if (params.class_id) filtered = filtered.filter((e) => e.class_id == params.class_id);
    if (params.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(
        (e) => e.title.toLowerCase().includes(q) || e.description.toLowerCase().includes(q)
      );
    }
    // For teacher, filter their entries
    if (params.teacher_id) {
      filtered = filtered.filter((e) => e.teacher_id == params.teacher_id);
    }
    filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return { data: paginate(filtered, params.page || 1) };
  },

  getEntry: async (id) => {
    await delay(200);
    const entry = diaryEntries.find((e) => e.id == id);
    if (!entry) throw new Error('Entry not found');
    return { data: { data: entry } };
  },

  createEntry: async (data) => {
    await delay(700);
    const entry = {
      ...data,
      id: nextDiaryId++,
      created_at: new Date().toISOString(),
      class_name: classes.find((c) => c.id == data.class_id)?.name || null,
      subject_name: subjects.find((s) => s.id == data.subject_id)?.name || null,
    };
    diaryEntries.unshift(entry);
    return { data: { data: entry, message: 'Entry created successfully' } };
  },

  updateEntry: async (id, data) => {
    await delay(500);
    const idx = diaryEntries.findIndex((e) => e.id == id);
    if (idx === -1) throw new Error('Entry not found');
    diaryEntries[idx] = {
      ...diaryEntries[idx],
      ...data,
      class_name: classes.find((c) => c.id == data.class_id)?.name || diaryEntries[idx].class_name,
      subject_name: subjects.find((s) => s.id == data.subject_id)?.name || diaryEntries[idx].subject_name,
    };
    return { data: { data: diaryEntries[idx], message: 'Entry updated successfully' } };
  },

  deleteEntry: async (id) => {
    await delay(400);
    const idx = diaryEntries.findIndex((e) => e.id == id);
    if (idx !== -1) diaryEntries.splice(idx, 1);
    return { data: { message: 'Entry deleted successfully' } };
  },

  getForParent: async (params = {}) => {
    await delay();
    // Parent sees entries for student_id 4 (Michael Brown)
    const parentEntries = diaryEntries.filter(
      (e) => e.student_id === 4 || e.student_id === null
    );
    return { data: paginate(parentEntries, params.page || 1) };
  },
};

export const mockUserService = {
  getUsers: async (params = {}) => {
    await delay();
    let filtered = [...users];
    if (params.role) filtered = filtered.filter((u) => u.role === params.role);
    if (params.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(
        (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
      );
    }
    return { data: paginate(filtered, params.page || 1) };
  },

  createUser: async (data) => {
    await delay(600);
    const newUser = {
      ...data,
      id: nextUserId++,
      created_at: new Date().toISOString(),
      status: 'active',
    };
    users.push(newUser);
    return { data: { data: newUser, message: 'User created successfully' } };
  },

  updateUser: async (id, data) => {
    await delay(400);
    const idx = users.findIndex((u) => u.id == id);
    if (idx !== -1) users[idx] = { ...users[idx], ...data };
    return { data: { data: users[idx], message: 'User updated' } };
  },

  deleteUser: async (id) => {
    await delay(400);
    const idx = users.findIndex((u) => u.id == id);
    if (idx !== -1) users.splice(idx, 1);
    return { data: { message: 'User deleted' } };
  },

  getStudents: async () => {
    await delay(300);
    return { data: { data: users.filter((u) => u.role === 'student') } };
  },

  getTeachers: async () => {
    await delay(300);
    return { data: { data: users.filter((u) => u.role === 'teacher') } };
  },

  getActivityLogs: async (params = {}) => {
    await delay();
    return { data: paginate([...MOCK_ACTIVITY_LOGS], params.page || 1, 8) };
  },
};

export const mockClassService = {
  getClasses: async (params = {}) => {
    await delay(300);
    return { data: { data: classes, meta: { total: classes.length } } };
  },

  createClass: async (data) => {
    await delay(500);
    const newClass = { ...data, id: classes.length + 1, student_count: 0 };
    classes.push(newClass);
    return { data: { data: newClass, message: 'Class created' } };
  },

  updateClass: async (id, data) => {
    await delay(400);
    const idx = classes.findIndex((c) => c.id == id);
    if (idx !== -1) classes[idx] = { ...classes[idx], ...data };
    return { data: { data: classes[idx], message: 'Class updated' } };
  },

  deleteClass: async (id) => {
    await delay(300);
    const idx = classes.findIndex((c) => c.id == id);
    if (idx !== -1) classes.splice(idx, 1);
    return { data: { message: 'Class deleted' } };
  },

  getSubjects: async () => {
    await delay(200);
    return { data: { data: subjects } };
  },

  createSubject: async (data) => {
    await delay(400);
    const newSubject = { ...data, id: subjects.length + 1 };
    subjects.push(newSubject);
    return { data: { data: newSubject, message: 'Subject created' } };
  },

  deleteSubject: async (id) => {
    await delay(300);
    const idx = subjects.findIndex((s) => s.id == id);
    if (idx !== -1) subjects.splice(idx, 1);
    return { data: { message: 'Subject deleted' } };
  },
};

export const mockStats = {
  getAdminStats: async () => {
    await delay(500);
    return { data: MOCK_STATS.admin };
  },
  getTeacherStats: async (teacherId) => {
    await delay(400);
    const myEntries = diaryEntries.filter((e) => e.teacher_id == teacherId);
    return {
      data: {
        myEntries: myEntries.length,
        homeworkCount: myEntries.filter((e) => e.type === 'homework').length,
        announcementCount: myEntries.filter((e) => e.type === 'announcement').length,
        remarkCount: myEntries.filter((e) => e.type === 'remark').length,
        myStudents: 28,
      },
    };
  },
};
