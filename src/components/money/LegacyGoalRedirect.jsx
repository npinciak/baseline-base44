import { Navigate, useParams } from 'react-router-dom';

export default function LegacyGoalRedirect() {
  const { goalId } = useParams();
  return <Navigate to={`/money/goals/${goalId}`} replace />;
}