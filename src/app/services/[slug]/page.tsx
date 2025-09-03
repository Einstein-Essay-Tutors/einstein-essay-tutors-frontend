import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchServiceBySlug, fetchServices } from '@/lib/api/services';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen,
  GraduationCap,
  FileText,
  Edit,
  Clock,
  CheckCircle,
  Star,
  ArrowRight,
  ArrowLeft,
  Users,
  Brain,
  Heart,
} from 'lucide-react';

// Helper function to get icon component from icon name
const getIconComponent = (iconName: string) => {
  const icons: { [key: string]: any } = {
    BookOpen,
    FileText,
    GraduationCap,
    Edit,
    Brain,
    Heart,
    Users,
    Clock,
    CheckCircle,
    Star,
  };
  return icons[iconName] || FileText;
};

interface ServicePageProps {
  params: {
    slug: string;
  };
}

// Generate static params for build-time optimization
export async function generateStaticParams() {
  try {
    const response = await fetchServices();
    return response.results.map(service => ({
      slug: service.slug,
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

// Generate metadata for each service
export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  try {
    const service = await fetchServiceBySlug(params.slug);
    return {
      title: `${service.title} - Einstein Essay Tutors`,
      description: service.description,
      keywords: `${service.title.toLowerCase()}, academic writing, tutoring`,
    };
  } catch (error) {
    return {
      title: 'Service Not Found - Einstein Essay Tutors',
      description: 'The requested service could not be found.',
    };
  }
}

export default async function ServicePage({ params }: ServicePageProps) {
  let service;

  try {
    service = await fetchServiceBySlug(params.slug);
  } catch (error) {
    notFound();
  }

  const IconComponent = getIconComponent(service.icon);

  // Sample data for service features (this could be extended to come from API)
  const serviceFeatures = [
    {
      icon: FileText,
      title: 'Original Content',
      description: 'Every piece is written from scratch according to your specific requirements.',
    },
    {
      icon: Users,
      title: 'Expert Writers',
      description: 'PhD holders and subject experts with proven academic writing experience.',
    },
    {
      icon: CheckCircle,
      title: 'Quality Guarantee',
      description: 'Free revisions until you are completely satisfied with your work.',
    },
    {
      icon: Clock,
      title: 'On-Time Delivery',
      description: 'Your work will be delivered exactly when you need it, guaranteed.',
    },
    {
      icon: Star,
      title: 'Top Grades',
      description: 'Our work is crafted to help you achieve the highest possible grades.',
    },
    {
      icon: CheckCircle,
      title: 'Plagiarism-Free',
      description: 'All work is 100% original and comes with a detailed plagiarism report.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/services">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Services
              </Button>
            </Link>
          </div>

          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="p-4 bg-primary/10 rounded-lg">
                <IconComponent className="h-12 w-12 text-primary" />
              </div>
              <div className="text-left">
                <h1 className="text-4xl lg:text-5xl font-bold text-gray-900">{service.title}</h1>
                <div className="flex items-center gap-4 mt-2">
                  <Badge variant="secondary">{service.pricing}</Badge>
                  <span className="flex items-center gap-1 text-gray-600">
                    <Clock className="h-4 w-4" />
                    {service.turnaround}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              {service.detailed_description || service.description}
            </p>

            <Link href="/order">
              <Button size="lg" className="text-lg px-8 py-3">
                Order Your {service.title} Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
              What You Get With Our {service.title} Service
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {serviceFeatures.map((feature, index) => (
                <div key={index} className="text-center">
                  <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <feature.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Service Features */}
      {service.features && service.features.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">
                Key Features of Our {service.title} Service
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
                {service.features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm"
                  >
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-400">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Service Types */}
      {service.service_types && service.service_types.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">
                Types of {service.title} We Offer
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {service.service_types.map((type, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm text-gray-400">{type}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Subjects */}
      {service.subjects && service.subjects.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">
                Subject Areas We Cover
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {service.subjects.map((subject, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-3 bg-white rounded-lg shadow-sm"
                  >
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm text-gray-400">{subject}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Process Steps */}
      {service.process_steps && service.process_steps.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">
                How Our {service.title} Process Works
              </h2>
              <p className="text-lg text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Simple, transparent process from order to delivery.
              </p>

              <div className="space-y-8">
                {service.process_steps.map((step, index) => (
                  <div key={index} className="flex items-start gap-6">
                    <div className="flex-shrink-0 w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {step.step || index + 1}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                      <p className="text-gray-400">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Ready to Order Your {service.title}?
          </h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Get professional {service.title.toLowerCase()} help from our expert writers. Quality
            guaranteed, delivered on time.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/order">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-3">
                Order Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-3 border-white text-white hover:bg-white hover:text-primary"
              >
                Ask Questions
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
