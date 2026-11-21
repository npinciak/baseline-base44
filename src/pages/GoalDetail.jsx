import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Link2, Wallet } from 'lucide-react';
import { formatDistanceToNow, differenceInMonths } from 'date-fns';
import ImagePickerModal from '@/components/ImagePickerModal';
import ConnectBankButton from '@/components/ConnectBankButton';
import GoalPlanner from '@/components/goal/GoalPlanner';
import GoalGuidance from '@/components/goal/GoalGuidance';
import GoalHeroCard from '@/components/goal/GoalHeroCard';
import BasePlanModules from '@/components/goal/BasePlanModules';
import SmartSuggestions from '@/components/goal/SmartSuggestions';
import GoalEditModal, { GOAL_TYPES } from '@/components/goal/GoalEditModal';
import useGoalPlan from '@/hooks/useGoalPlan';
import { CARD, ICON_BOX, BTN_T } from '@/lib/goalStyles';

const GOAL_TOPIC_MAP = {
  vacation: ['saving'],
  travel: ['saving'],
  buyHome: ['investing', 'saving'],
  newCar: ['budgeting'],
  other: ['saving', 'budgeting'],
  unknown: ['saving', 'budgeting'],
};

export default function GoalDetail() {
  const { goalId } = useParams();
  const navigate = useNavigate();
  const [goal, setGoal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [imagePickerTarget, setImagePickerTarget] = useState('edit');
  const [relevantModules, setRelevantModules] = useState([]);
  const [userProgress, setUserProgress] = useState([]);
  const goalPlan = useGoalPlan(goalId);

  useEffect(() => {
    const init = async () => {
      const [goalsRes, user] = await Promise.all([
        base44.functions.invoke('getSupabaseGoals', {}),
        base44.auth.me(),
      ]);
      const found = (goalsRes?.data?.goals || []).find(g => g.id === goalId);
      setGoal(found || null);

      if (found) {
        setForm({
          name: found.name || '',
          goal_type: found.goal_type || '',
          target_amount: found.target_amount || '',
          saved_amount: found.current_amount || 0,
          target_date: found.target_date || '',
          image_url: found.image || '',
        });

        const [mods, prog] = await Promise.all([
          base44.entities.Module.filter({ is_published: true }, 'order_index', 50),
          base44.entities.UserProgress.filter({ user_id: user.id }),
        ]);

        const relevantTags = GOAL_TOPIC_MAP[found.goal_type] || ['saving', 'budgeting'];
        setRelevantModules(mods.filter(m => relevantTags.includes(m.topic_tag)).slice(0, 3));
        setUserProgress(prog);
      }
    };
    init().finally(() => setLoading(false));
  }, [goalId]);

  const handleSave = async () => {
    if (!form.name || !form.target_amount) return;
    setSaving(true);
    let imageUrl = form.image_url;
    if (!imageUrl) {
      const searchTerm = form.goal_type && form.goal_type !== 'unknown' ? form.goal_type : form.name;
      const res = await base44.integrations.custom.call('unsplash', 'get:/search/photos', {
        queryParams: { query: searchTerm, per_page: 1 },
      }).catch(() => null);
      imageUrl = res?.data?.results?.[0]?.urls?.regular || '';
    }
    await base44.functions.invoke('updateSupabaseGoal', {
      supabaseGoalId: goalId,
      name: form.name,
      goal_type: form.goal_type || null,
      image: imageUrl || null,
      target_amount: parseFloat(form.target_amount),
      current_amount: parseFloat(form.saved_amount) || 0,
      target_date: form.target_date || null,
    });
    setGoal(g => ({
      ...g,
      name: form.name,
      goal_type: form.goal_type,
      image: imageUrl,
      current_amount: parseFloat(form.saved_amount) || 0,
      target_amount: parseFloat(form.target_amount),
      target_date: form.target_date,
    }));
    setSaving(false);
    setShowEdit(false);
  };

  const handleDelete = async () => {
    if (!confirm(`Delete "${goal.name}"? This cannot be undone.`)) return;
    await base44.functions.invoke('deleteSupabaseGoal', { supabaseGoalId: goalId }).catch(() => {});
    navigate('/money#goals');
  };

  const handleMarkComplete = async () => {
    await base44.functions.invoke('updateSupabaseGoal', {
      supabaseGoalId: goalId,
      current_amount: goal.target_amount,
    }).catch(() => {});
    setGoal(g => ({ ...g, current_amount: g.target_amount }));
  };

  const handleImagePickerSelect = ({ url }) => {
    if (imagePickerTarget === 'hero') {
      setGoal(g => ({ ...g, image: url }));
      setForm(p => ({ ...p, image_url: url }));
      base44.functions.invoke('updateSupabaseGoal', { supabaseGoalId: goalId, image: url }).catch(() => {});
    } else {
      setForm(p => ({ ...p, image_url: url }));
    }
    setShowImagePicker(false);
  };

  const isModuleCompleted = (moduleId) =>
    userProgress.some(p => p.module_id === moduleId && p.completed);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#07090b]">
        <div className="w-8 h-8 border-4 border-white/10 border-t-[#2EFD7A] rounded-full animate-spin" />
      </div>
    );
  }

  if (!goal) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-[#07090b]">
        <p className="text-white/60">Goal not found.</p>
        <button onClick={() => navigate('/money#goals')} className="text-[#2EFD7A] text-sm font-semibold hover:underline">Back to Money</button>
      </div>
    );
  }

  const saved = goal.current_amount || 0;
  const target = goal.target_amount || 0;
  const monthsLeft = goal.target_date ? differenceInMonths(new Date(goal.target_date), new Date()) : null;
  const typeLabel = goal.goal_type ? (GOAL_TYPES.find(t => t.value === goal.goal_type)?.label || goal.goal_type) : '';

  return (
    <div className="relative min-h-screen bg-[#07090b] text-[#e9efec] overflow-hidden">
      <div className="goal-glow" />
      <div className="relative max-w-6xl mx-auto px-4 sm:px-10 pt-8 pb-16">
        <button onClick={() => navigate('/money#goals')} className={`${BTN_T} goal-rise flex items-center gap-1.5 text-[13px] font-medium text-[#8a9a93] hover:text-white mb-5 py-1`}>
          <ArrowLeft className="w-4 h-4" /> Back to Money
        </button>

        <div className="grid lg:grid-cols-3 gap-5">
          <div className="lg:col-span-3 goal-rise [animation-delay:.05s]">
            <GoalHeroCard goal={goal} typeLabel={typeLabel} saved={saved} target={target} onEdit={() => setShowEdit(true)} onComplete={handleMarkComplete} onDelete={handleDelete} />
          </div>

          <div className="lg:col-span-2 goal-rise [animation-delay:.15s]">
            {!goalPlan.loading && (
              <GoalPlanner goal={goal} plan={goalPlan.plan} saving={goalPlan.saving} onSave={goalPlan.save}>
                <BasePlanModules modules={relevantModules} isCompleted={isModuleCompleted} />
              </GoalPlanner>
            )}
          </div>

          <div className="flex flex-col gap-5 goal-rise [animation-delay:.25s]">
            <div className={`${CARD} p-[22px]`}>
              <div className="flex items-center gap-3 mb-[14px]">
                <div className={ICON_BOX}><Link2 className="w-4 h-4 text-[#2efd7a]" /></div>
                <h3 className="text-sm font-bold">Linked Account</h3>
              </div>
              {goal.linked_accounts_balance && goal.linked_accounts_balance > 0 ? (
                <div>
                  <p className="text-3xl font-extrabold text-[#2efd7a] mb-1">${parseFloat(goal.linked_accounts_balance).toLocaleString()}</p>
                  <p className="text-xs text-[#8a9a93]">
                    {goal.last_balance_sync_at
                      ? `Last synced ${formatDistanceToNow(new Date(goal.last_balance_sync_at), { addSuffix: true })}`
                      : 'Balance from linked bank account'}
                  </p>
                </div>
              ) : (
                <div className="text-center py-2.5">
                  <div className="w-10 h-10 rounded-xl bg-[#1a2024] flex items-center justify-center mx-auto"><Wallet className="w-5 h-5 text-[#8a9a93]" /></div>
                  <p className="text-[13px] text-[#8a9a93] mt-3 mb-4 leading-normal">Connect a bank account to track this goal automatically</p>
                  <ConnectBankButton />
                </div>
              )}
            </div>
            {!goalPlan.loading && <GoalGuidance goal={goal} plan={goalPlan.plan} />}
          </div>

          <div className="lg:col-span-3 goal-rise [animation-delay:.35s]">
            <SmartSuggestions goalType={goal.goal_type} monthsLeft={monthsLeft} />
          </div>
        </div>
      </div>

      {showEdit && (
        <GoalEditModal
          form={form}
          setForm={setForm}
          saving={saving}
          onSave={handleSave}
          onClose={() => setShowEdit(false)}
          onPickImage={() => { setImagePickerTarget('edit'); setShowImagePicker(true); }}
        />
      )}

      {showImagePicker && (
        <ImagePickerModal onSelect={handleImagePickerSelect} onClose={() => setShowImagePicker(false)} />
      )}
    </div>
  );
}