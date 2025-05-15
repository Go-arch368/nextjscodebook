
import React from "react";
import { Suspense } from "react";
import TemplateContent from "@/carservice/TemplateContent";

const TemplatePage: React.FC = () => {
  return (
    <Suspense fallback={<div className="container mx-auto p-4">Loading...</div>}>
      <TemplateContent />
    </Suspense>
  );
};

export default TemplatePage;