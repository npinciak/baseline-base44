import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Plus, Edit2, Trash2, Eye, EyeOff, BookOpen, Award, Users, ChevronDown, ChevronRight, X, Save } from 'lucide-react';
import AmbientBackdrop from '@/components/dashboard/AmbientBackdrop';

const TABS = ['Modules', 'Badges', 'Users'];

const TOPIC_TAGS = ['budgeting', 'investing', 'credit', 'taxes', 'saving', 'debt', 'insurance', 'retirement'];
const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'];
const LESSON_TYPES = ['text', 'quiz', 'flashcard'];
const TRIGGER_TYPES = ['lesson_complete', 'module_complete', 'xp_threshold', 'streak_days', 'first_login'];

const containerVariants = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 22 } },
};

export default function Admin() {
  const [tab, setTab] = useState('Modules');
  const [user, setUser] = useState(null);
  const [authorized, setAuthorized] = useState(false);
  const [modules, setModules] = useState([]);
  const [badges, setBadges] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedModule, setExpandedModule] = useState(null);
  const [lessons, setLessons] = useState({});

  // Module form
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [editingModule, setEditingModule] = useState(null);
  const [moduleForm, setModuleForm] = useState({ title: '', description: '', topic_tag: 'budgeting', difficulty: 'beginner', order_index: 0, xp_reward: 100, is_published: false });

  // Lesson form
  const [showLessonForm, setShowLessonForm] = useState(null);
  const [lessonForm, setLessonForm] = useState({ title: '', content: '', lesson_type: 'text', order_index: 0, xp_reward: 20, is_published: true });

  // Badge form
  const [showBadgeForm, setShowBadgeForm] = useState(false);
  const [editingBadge, setEditingBadge] = useState(null);
  const [badgeForm, setBadgeForm] = useState({ name: '', description: '', icon: '🏅', trigger_type: 'lesson_complete', trigger_value: 1 });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      setAuthorized(u?.role === 'admin');
    });
  }, []);

  useEffect(() => {
    if (!authorized) return;
    const load = async () => {
      const [mods, bdgs, usrs] = await Promise.all([
        base44.entities.Module.list('order_index', 50),
        base44.entities.Badge.list(),
        base44.entities.User.list(),
      ]);
      setModules(mods);
      setBadges(bdgs);
      setUsers(usrs);
      setLoading(false);
    };
    load().catch(() => setLoading(false));
  }, [authorized]);

  const loadLessons = async (moduleId) => {
    if (lessons[moduleId]) return;
    const lsns = await base44.entities.Lesson.filter({ module_id: moduleId }, 'order_index', 50);
    setLessons(p => ({ ...p, [moduleId]: lsns }));
  };

  const toggleModule = async (id) => {
    if (expandedModule === id) {
      setExpandedModule(null);
    } else {
      setExpandedModule(id);
      await loadLessons(id);
    }
  };

  const handleSaveModule = async () => {
    setSaving(true);
    if (editingModule) {
      await base44.entities.Module.update(editingModule.id, moduleForm);
      setModules(ms => ms.map(m => m.id === editingModule.id ? { ...m, ...moduleForm } : m));
    } else {
      const created = await base44.entities.Module.create(moduleForm);
      setModules(ms => [...ms, created]);
    }
    setShowModuleForm(false);
    setEditingModule(null);
    setSaving(false);
  };

  const handleDeleteModule = async (id) => {
    await base44.entities.Module.delete(id);
    setModules(ms => ms.filter(m => m.id !== id));
  };

  const handleTogglePublish = async (mod) => {
    const updated = { ...mod, is_published: !mod.is_published };
    await base44.entities.Module.update(mod.id, { is_published: updated.is_published });
    setModules(ms => ms.map(m => m.id === mod.id ? updated : m));
  };

  const handleSaveLesson = async (moduleId) => {
    setSaving(true);
    const created = await base44.entities.Lesson.create({ ...lessonForm, module_id: moduleId });
    setLessons(p => ({ ...p, [moduleId]: [...(p[moduleId] || []), created] }));
    setShowLessonForm(null);
    setLessonForm({ title: '', content: '', lesson_type: 'text', order_index: 0, xp_reward: 20, is_published: true });
    setSaving(false);
  };

  const handleDeleteLesson = async (lessonId, moduleId) => {
    await base44.entities.Lesson.delete(lessonId);
    setLessons(p => ({ ...p, [moduleId]: p[moduleId].filter(l => l.id !== lessonId) }));
  };

  const handleSaveBadge = async () => {
    setSaving(true);
    if (editingBadge) {
      await base44.entities.Badge.update(editingBadge.id, badgeForm);
      setBadges(bs => bs.map(b => b.id === editingBadge.id ? { ...b, ...badgeForm } : b));
    } else {
      const created = await base44.entities.Badge.create(badgeForm);
      setBadges(bs => [...bs, created]);
    }
    setShowBadgeForm(false);
    setEditingBadge(null);
    setSaving(false);
  };

  if (!authorized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-center">
          <p className="text-2xl font-display font-bold mb-2 text-white">Access Denied</p>
          <p className="text-white/50">Admin role required.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="w-8 h-8 border-4 border-white/10 border-t-[#2EFD7A] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      <AmbientBackdrop />
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="relative z-10 max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-8">
          <h1 className="text-3xl font-display font-extrabold text-white mb-1">Admin Portal</h1>
          <p className="text-white/60">Manage content, badges, and users</p>
        </motion.div>

        {/* Stats */}
        <motion.div variants={itemVariants} className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Modules', value: modules.length, icon: BookOpen },
            { label: 'Badges', value: badges.length, icon: Award },
            { label: 'Users', value: users.length, icon: Users },
          ].map(({ label, value, icon: Icon }) => (
            <motion.div key={label} whileHover={{ y: -2 }} className="bg-white/[0.03] border border-white/10 backdrop-blur-sm rounded-xl p-5 flex items-center gap-4">
              <div className="w-10 h-10 bg-[#2EFD7A]/15 rounded-lg flex items-center justify-center">
                <Icon className="w-5 h-5 text-[#2EFD7A]" />
              </div>
              <div>
                <p className="text-2xl font-display font-bold text-white">{value}</p>
                <p className="text-xs text-white/50">{label}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Tabs */}
        <motion.div variants={itemVariants} className="flex gap-1 bg-white/[0.05] rounded-xl p-1 mb-6 w-fit">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                tab === t ? 'bg-[#2EFD7A] text-black' : 'text-white/50 hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </motion.div>

        {/* Modules tab */}
        {tab === 'Modules' && (
          <motion.div variants={itemVariants}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-heading font-semibold text-white">Learning Modules</h2>
              <button
                onClick={() => { setEditingModule(null); setModuleForm({ title: '', description: '', topic_tag: 'budgeting', difficulty: 'beginner', order_index: modules.length, xp_reward: 100, is_published: false }); setShowModuleForm(true); }}
                className="flex items-center gap-2 px-4 py-2 bg-[#2EFD7A] text-black rounded-xl text-sm font-semibold hover:bg-[#2EFD7A]/90 transition-all"
              >
                <Plus className="w-4 h-4" /> New Module
              </button>
            </div>
            <div className="space-y-3">
              {modules.map((mod) => (
                <div key={mod.id} className="bg-white/[0.03] border border-white/10 backdrop-blur-sm rounded-2xl overflow-hidden">
                  <div className="flex items-center gap-3 p-4">
                    <button onClick={() => toggleModule(mod.id)} className="text-white/40 hover:text-white">
                      {expandedModule === mod.id ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm text-white">{mod.title}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${mod.is_published ? 'bg-[#2EFD7A]/15 text-[#2EFD7A]' : 'bg-white/10 text-white/50'}`}>
                          {mod.is_published ? 'Published' : 'Draft'}
                        </span>
                      </div>
                      <p className="text-xs text-white/50 capitalize">{mod.topic_tag} · {mod.difficulty}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleTogglePublish(mod)} className="p-1.5 text-white/40 hover:text-white transition-colors">
                        {mod.is_published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button onClick={() => { setEditingModule(mod); setModuleForm({ title: mod.title, description: mod.description || '', topic_tag: mod.topic_tag, difficulty: mod.difficulty, order_index: mod.order_index || 0, xp_reward: mod.xp_reward || 100, is_published: mod.is_published }); setShowModuleForm(true); }} className="p-1.5 text-white/40 hover:text-white transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteModule(mod.id)} className="p-1.5 text-white/40 hover:text-red-400 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded lessons */}
                  {expandedModule === mod.id && (
                    <div className="border-t border-white/10 bg-white/[0.02] p-4">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-semibold text-white/60">Lessons</p>
                        <button
                          onClick={() => setShowLessonForm(mod.id)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-[#2EFD7A]/15 text-[#2EFD7A] rounded-lg text-xs font-semibold hover:bg-[#2EFD7A]/25 transition-all"
                        >
                          <Plus className="w-3 h-3" /> Add Lesson
                        </button>
                      </div>
                      {(lessons[mod.id] || []).length === 0 ? (
                        <p className="text-xs text-white/50">No lessons yet. Add the first one!</p>
                      ) : (
                        <div className="space-y-2">
                          {(lessons[mod.id] || []).map((lesson, i) => (
                            <div key={lesson.id} className="flex items-center gap-3 bg-white/[0.03] border border-white/10 rounded-xl p-3">
                              <span className="text-xs text-white/40 w-5">{i + 1}.</span>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-white">{lesson.title}</p>
                                <p className="text-xs text-white/50 capitalize">{lesson.lesson_type} · {lesson.xp_reward} XP</p>
                              </div>
                              <button onClick={() => handleDeleteLesson(lesson.id, mod.id)} className="p-1 text-white/40 hover:text-red-400 transition-colors">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add lesson form */}
                      {showLessonForm === mod.id && (
                        <div className="mt-4 bg-white/[0.03] border border-white/10 rounded-xl p-4 space-y-3">
                          <p className="text-sm font-semibold text-white">New Lesson</p>
                          <input value={lessonForm.title} onChange={e => setLessonForm(p => ({ ...p, title: e.target.value }))} placeholder="Lesson title" className="w-full bg-white/[0.05] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#2EFD7A]" />
                          <select value={lessonForm.lesson_type} onChange={e => setLessonForm(p => ({ ...p, lesson_type: e.target.value }))} className="w-full bg-white/[0.05] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#2EFD7A]">
                            {LESSON_TYPES.map(t => <option key={t} value={t} className="bg-black">{t}</option>)}
                          </select>
                          <textarea value={lessonForm.content} onChange={e => setLessonForm(p => ({ ...p, content: e.target.value }))} placeholder="Lesson content (markdown supported)" rows={4} className="w-full bg-white/[0.05] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#2EFD7A] resize-none" />
                          <div className="grid grid-cols-2 gap-2">
                            <input type="number" value={lessonForm.xp_reward} onChange={e => setLessonForm(p => ({ ...p, xp_reward: parseInt(e.target.value) }))} placeholder="XP reward" className="bg-white/[0.05] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#2EFD7A]" />
                            <input type="number" value={lessonForm.order_index} onChange={e => setLessonForm(p => ({ ...p, order_index: parseInt(e.target.value) }))} placeholder="Order" className="bg-white/[0.05] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#2EFD7A]" />
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => setShowLessonForm(null)} className="flex-1 py-2 bg-white/10 text-white rounded-lg text-sm font-medium hover:bg-white/15 transition-all">Cancel</button>
                            <button onClick={() => handleSaveLesson(mod.id)} disabled={saving || !lessonForm.title} className="flex-1 py-2 bg-[#2EFD7A] text-black rounded-lg text-sm font-medium hover:bg-[#2EFD7A]/90 transition-all disabled:opacity-50">
                              <Save className="w-3.5 h-3.5 inline mr-1" /> {saving ? 'Saving...' : 'Save'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Badges tab */}
        {tab === 'Badges' && (
          <motion.div variants={itemVariants}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-heading font-semibold text-white">Badges</h2>
              <button
                onClick={() => { setEditingBadge(null); setBadgeForm({ name: '', description: '', icon: '🏅', trigger_type: 'lesson_complete', trigger_value: 1 }); setShowBadgeForm(true); }}
                className="flex items-center gap-2 px-4 py-2 bg-[#2EFD7A] text-black rounded-xl text-sm font-semibold hover:bg-[#2EFD7A]/90 transition-all"
              >
                <Plus className="w-4 h-4" /> New Badge
              </button>
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              {badges.map(b => (
                <div key={b.id} className="bg-white/[0.03] border border-white/10 backdrop-blur-sm rounded-2xl p-4 flex items-center gap-4">
                  <span className="text-4xl">{b.icon || '🏅'}</span>
                  <div className="flex-1">
                    <p className="font-semibold text-white">{b.name}</p>
                    <p className="text-xs text-white/50">{b.description}</p>
                    <p className="text-xs text-white/40 mt-1 capitalize">{b.trigger_type.replace('_', ' ')} · Value: {b.trigger_value}</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => { setEditingBadge(b); setBadgeForm({ name: b.name, description: b.description || '', icon: b.icon || '🏅', trigger_type: b.trigger_type, trigger_value: b.trigger_value || 1 }); setShowBadgeForm(true); }} className="p-1.5 text-white/40 hover:text-white">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={async () => { await base44.entities.Badge.delete(b.id); setBadges(bs => bs.filter(x => x.id !== b.id)); }} className="p-1.5 text-white/40 hover:text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Users tab */}
        {tab === 'Users' && (
          <motion.div variants={itemVariants}>
            <h2 className="text-lg font-heading font-semibold mb-4 text-white">Registered Users ({users.length})</h2>
            <div className="bg-white/[0.03] border border-white/10 backdrop-blur-sm rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-white/50">Name</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-white/50">Email</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-white/50">Role</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-white/50">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} className="border-b border-white/10 last:border-0 hover:bg-white/[0.03] transition-colors">
                      <td className="px-4 py-3 font-medium text-white">{u.full_name}</td>
                      <td className="px-4 py-3 text-white/50">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${u.role === 'admin' ? 'bg-amber-400/15 text-amber-400' : 'bg-white/10 text-white/50'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-white/40 text-xs">{new Date(u.created_date).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Module form modal */}
      {showModuleForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            className="bg-white/[0.05] border border-white/10 backdrop-blur-md rounded-3xl p-6 w-full max-w-md"
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-heading font-bold text-white">{editingModule ? 'Edit Module' : 'New Module'}</h3>
              <button onClick={() => setShowModuleForm(false)}><X className="w-5 h-5 text-white/50" /></button>
            </div>
            <div className="space-y-4">
              <input value={moduleForm.title} onChange={e => setModuleForm(p => ({ ...p, title: e.target.value }))} placeholder="Module title" className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#2EFD7A]" />
              <textarea value={moduleForm.description} onChange={e => setModuleForm(p => ({ ...p, description: e.target.value }))} placeholder="Description" rows={3} className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#2EFD7A] resize-none" />
              <div className="grid grid-cols-2 gap-3">
                <select value={moduleForm.topic_tag} onChange={e => setModuleForm(p => ({ ...p, topic_tag: e.target.value }))} className="bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#2EFD7A]">
                  {TOPIC_TAGS.map(t => <option key={t} value={t} className="bg-black">{t}</option>)}
                </select>
                <select value={moduleForm.difficulty} onChange={e => setModuleForm(p => ({ ...p, difficulty: e.target.value }))} className="bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#2EFD7A]">
                  {DIFFICULTIES.map(d => <option key={d} value={d} className="bg-black">{d}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input type="number" value={moduleForm.xp_reward} onChange={e => setModuleForm(p => ({ ...p, xp_reward: parseInt(e.target.value) }))} placeholder="XP reward" className="bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#2EFD7A]" />
                <input type="number" value={moduleForm.order_index} onChange={e => setModuleForm(p => ({ ...p, order_index: parseInt(e.target.value) }))} placeholder="Order index" className="bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#2EFD7A]" />
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={moduleForm.is_published} onChange={e => setModuleForm(p => ({ ...p, is_published: e.target.checked }))} className="rounded accent-[#2EFD7A]" />
                <span className="text-sm font-medium text-white">Publish immediately</span>
              </label>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModuleForm(false)} className="flex-1 py-3 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/15 transition-all text-sm">Cancel</button>
              <button onClick={handleSaveModule} disabled={saving || !moduleForm.title} className="flex-1 py-3 bg-[#2EFD7A] text-black rounded-xl font-semibold hover:bg-[#2EFD7A]/90 transition-all text-sm disabled:opacity-50">
                {saving ? 'Saving...' : editingModule ? 'Update' : 'Create'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Badge form modal */}
      {showBadgeForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            className="bg-white/[0.05] border border-white/10 backdrop-blur-md rounded-3xl p-6 w-full max-w-md"
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-heading font-bold text-white">{editingBadge ? 'Edit Badge' : 'New Badge'}</h3>
              <button onClick={() => setShowBadgeForm(false)}><X className="w-5 h-5 text-white/50" /></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <input value={badgeForm.icon} onChange={e => setBadgeForm(p => ({ ...p, icon: e.target.value }))} placeholder="Icon emoji" className="bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#2EFD7A] text-center text-xl" />
                <input value={badgeForm.name} onChange={e => setBadgeForm(p => ({ ...p, name: e.target.value }))} placeholder="Badge name" className="col-span-2 bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#2EFD7A]" />
              </div>
              <input value={badgeForm.description} onChange={e => setBadgeForm(p => ({ ...p, description: e.target.value }))} placeholder="Description" className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#2EFD7A]" />
              <div className="grid grid-cols-2 gap-3">
                <select value={badgeForm.trigger_type} onChange={e => setBadgeForm(p => ({ ...p, trigger_type: e.target.value }))} className="bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#2EFD7A]">
                  {TRIGGER_TYPES.map(t => <option key={t} value={t} className="bg-black">{t.replace(/_/g, ' ')}</option>)}
                </select>
                <input type="number" value={badgeForm.trigger_value} onChange={e => setBadgeForm(p => ({ ...p, trigger_value: parseInt(e.target.value) }))} placeholder="Trigger value" className="bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#2EFD7A]" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowBadgeForm(false)} className="flex-1 py-3 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/15 transition-all text-sm">Cancel</button>
              <button onClick={handleSaveBadge} disabled={saving || !badgeForm.name} className="flex-1 py-3 bg-[#2EFD7A] text-black rounded-xl font-semibold hover:bg-[#2EFD7A]/90 transition-all text-sm disabled:opacity-50">
                {saving ? 'Saving...' : editingBadge ? 'Update' : 'Create'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}