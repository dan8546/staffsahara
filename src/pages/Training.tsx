import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, BookOpen, CheckCircle, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Seo } from "@/components/Seo";

interface TrainingCourse {
  id: string;
  code: string;
  title: string;
  description: string;
  duration_hours: number;
  reqs: any; // Using any for JSON field compatibility
  created_at: string;
}

const Training = () => {
  const { t } = useTranslation();
  const [courses, setCourses] = useState<TrainingCourse[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCourses = async () => {
    try {
      const { data, error } = await supabase
        .from("training_courses")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) throw error;
      setCourses((data || []) as TrainingCourse[]);
    } catch (error) {
      console.error("Error loading courses:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  if (loading) {
    return (
      <div className="container max-w-6xl mx-auto px-4 py-12">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Seo 
        title="Formations RMTC — Staff Sahara"
        description="Catalogue officiel RedMed Training Center : H2S, BOSIET, Secourisme…"
      />
      
      <div className="container max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-ink-900 mb-4">
            {t("training.title")}
          </h1>
          <p className="text-xl text-ink-600 max-w-2xl mx-auto">
            {t("training.browse")}
          </p>
        </div>

        {/* Courses Grid */}
        {courses.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-xl text-muted-foreground">{t("training.empty")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Card key={course.id} className="group hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <Badge variant="outline" className="mb-2">
                      {course.code}
                    </Badge>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 mr-1" />
                      {course.duration_hours}h
                    </div>
                  </div>
                  <CardTitle className="text-xl text-brand-blue group-hover:text-brand-blue/80 transition-colors">
                    {course.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-ink-600 line-clamp-3">
                    {course.description}
                  </p>
                  
                  {course.reqs && course.reqs.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm text-ink-700 mb-2">
                        {t("training.prereqs")}:
                      </h4>
                      <ul className="space-y-1">
                        {course.reqs.map((req, index) => (
                          <li key={index} className="flex items-center text-sm text-ink-600">
                            <CheckCircle className="h-3 w-3 mr-2 text-green-500" />
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <div className="pt-4">
                    <Button asChild className="w-full group/btn">
                      <Link to={`/training/${course.id}`}>
                        Voir les détails
                        <ArrowRight className="h-4 w-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Training;