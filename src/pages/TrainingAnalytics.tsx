import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, TrendingUp, Users, BookOpen, Calendar, Trophy } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Seo } from '@/components/Seo';

interface AnalyticsKPIs {
  total_courses: number;
  upcoming_sessions: number;
  enrollments_30d: number;
  certificates_30d: number;
}

interface TopCourse {
  code: string;
  title: string;
  enrollments_count_30d: number;
}

const TrainingAnalytics = () => {
  const { t } = useTranslation();
  const [kpis, setKpis] = useState<AnalyticsKPIs>({
    total_courses: 0,
    upcoming_sessions: 0,
    enrollments_30d: 0,
    certificates_30d: 0
  });
  const [topCourses, setTopCourses] = useState<TopCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const now = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Parallel queries for KPIs
      const [coursesRes, sessionsRes, enrollmentsRes, certificatesRes] = await Promise.all([
        supabase.from('training_courses').select('id', { count: 'exact', head: true }),
        supabase
          .from('training_sessions')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'scheduled')
          .gte('starts_at', now.toISOString()),
        supabase
          .from('enrollments')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', thirtyDaysAgo.toISOString()),
        supabase
          .from('certificates')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', thirtyDaysAgo.toISOString())
      ]);

      setKpis({
        total_courses: coursesRes.count || 0,
        upcoming_sessions: sessionsRes.count || 0,
        enrollments_30d: enrollmentsRes.count || 0,
        certificates_30d: certificatesRes.count || 0
      });

      // Top courses in last 30 days
      const { data: enrollmentData } = await supabase
        .from('enrollments')
        .select(`
          session_id,
          training_sessions!inner(course_id),
          training_courses!inner(code, title)
        `)
        .gte('created_at', thirtyDaysAgo.toISOString());

      // Process top courses (group by course)
      const courseStats = enrollmentData?.reduce((acc, enrollment) => {
        const course = enrollment.training_courses as any;
        if (course) {
          const key = course.code;
          if (!acc[key]) {
            acc[key] = {
              code: course.code,
              title: course.title,
              enrollments_count_30d: 0
            };
          }
          acc[key].enrollments_count_30d++;
        }
        return acc;
      }, {} as Record<string, TopCourse>) || {};

      const sortedCourses = Object.values(courseStats)
        .sort((a, b) => b.enrollments_count_30d - a.enrollments_count_30d)
        .slice(0, 10);

      setTopCourses(sortedCourses);

    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const kpiCards = [
    {
      title: t('analytics.kpis.courses'),
      value: kpis.total_courses,
      icon: BookOpen,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: t('analytics.kpis.upcoming'),
      value: kpis.upcoming_sessions,
      icon: Calendar,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: t('analytics.kpis.enroll_30d'),
      value: kpis.enrollments_30d,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: t('analytics.kpis.certs_30d'),
      value: kpis.certificates_30d,
      icon: Trophy,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ];

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-surface-muted rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-surface-muted rounded-2xl"></div>
            ))}
          </div>
          <div className="h-64 bg-surface-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Seo 
        title={`${t('analytics.title')} - Staff Sahara`}
        description="Training analytics and performance dashboard for RMTC"
      />
      
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-ink-900 mb-2 flex items-center gap-3">
          <BarChart3 className="h-8 w-8 text-brand-blue" />
          {t('analytics.title')}
        </h1>
        <p className="text-ink-600">
          Performance overview and key metrics for training operations
        </p>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {kpiCards.map((kpi, index) => (
          <Card key={index} className="rounded-2xl border p-6 hover:shadow-soft transition-all">
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-ink-600 mb-1">{kpi.title}</p>
                  <p className="text-3xl font-bold text-ink-900">{kpi.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-2xl ${kpi.bgColor} flex items-center justify-center`}>
                  <kpi.icon className={`h-6 w-6 ${kpi.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Top Courses */}
      <Card className="rounded-2xl border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-brand-blue" />
            {t('analytics.top_courses')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {topCourses.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-ink-600">No enrollment data for the last 30 days</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-ink-700">Code</th>
                    <th className="text-left py-3 px-4 font-medium text-ink-700">Course Title</th>
                    <th className="text-right py-3 px-4 font-medium text-ink-700">Enrollments</th>
                  </tr>
                </thead>
                <tbody>
                  {topCourses.map((course, index) => (
                    <tr key={course.code} className="border-b hover:bg-surface-muted/50">
                      <td className="py-3 px-4">
                        <Badge variant="outline">{course.code}</Badge>
                      </td>
                      <td className="py-3 px-4 font-medium">{course.title}</td>
                      <td className="py-3 px-4 text-right">
                        <Badge className="bg-brand-blue text-white">
                          {course.enrollments_count_30d}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TrainingAnalytics;