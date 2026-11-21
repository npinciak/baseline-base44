import { PieChart } from 'lucide-react';
import FeaturePanel from '@/components/money/FeaturePanel';
import SpendingDonut from '@/components/money/SpendingDonut';
import CategoryList from '@/components/money/CategoryList';

export default function SpendingTool({ categoryList, grandTotal, expenses }) {
  return (
    <FeaturePanel icon={PieChart} kicker="Spending breakdown">
      <div className="grid lg:grid-cols-2 gap-6">
        <SpendingDonut categoryList={categoryList} total={grandTotal} />
        <CategoryList categoryList={categoryList} grandTotal={grandTotal} expenses={expenses} />
      </div>
    </FeaturePanel>
  );
}