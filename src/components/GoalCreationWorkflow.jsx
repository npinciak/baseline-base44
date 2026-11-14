import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// All entry points use the same chapter-gated savings setup and subscription rules.
export default function GoalCreationWorkflow({ onClose }) {
  const navigate = useNavigate();
  useEffect(() => { navigate('/money#goals'); onClose?.(); }, [navigate, onClose]);
  return null;
}