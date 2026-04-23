"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import LegalLayout from "../../components/layout/LegalLayout";
import { Loader2 } from "lucide-react";

export default function PrivacyPolicy() {
  const [data, setData] = useState({ title: "Privacy Policy", sections: [] });
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  useEffect(() => {
    const fetchPageData = async () => {
      try {
        const response = await axios.get(`${API_URL}/legal-pages/privacy`);
        if (response.data && response.data.title) {
          setData(response.data);
        }
      } catch (error) {
        console.error("Error fetching privacy policy:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPageData();
  }, [API_URL]);

  return (
    <LegalLayout activePage="privacy">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 border-b border-gray-200 pb-4">
        {data.title}
      </h1>
      
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      ) : (
        <div className="prose prose-blue max-w-none text-gray-600">
          {data.sections && data.sections.length > 0 ? (
            data.sections.map((section, index) => (
              <section key={index} className="mb-8">
                <h2 className="text-xl font-semibold mb-3 text-gray-900">{section.title}</h2>
                {section.content && (
                  <p className="mb-4 leading-relaxed whitespace-pre-wrap">{section.content}</p>
                )}
                {section.points && section.points.length > 0 && (
                  <ul className="list-disc pl-5 mb-4 space-y-2">
                    {section.points.map((point, pIndex) => (
                      <li key={pIndex}>{point}</li>
                    ))}
                  </ul>
                )}
              </section>
            ))
          ) : (
            <p className="text-gray-500 italic">No content available at the moment.</p>
          )}
        </div>
      )}
    </LegalLayout>
  );
}
