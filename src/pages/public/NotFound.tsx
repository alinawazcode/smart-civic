import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/common/Button';

export const NotFound: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-[#FBE6E6] text-[#D64545] flex items-center justify-center mx-auto">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-extrabold text-[#14231F]">Page Not Found (404)</h1>
      <p className="text-sm text-[#6B7C77] max-w-md">
        The requested municipal route or complaint identifier could not be located.
      </p>
      <Link to="/">
        <Button size="md" leftIcon={<ArrowLeft className="w-4 h-4" />}>
          Return to CivicCare Home
        </Button>
      </Link>
    </div>
  );
};
