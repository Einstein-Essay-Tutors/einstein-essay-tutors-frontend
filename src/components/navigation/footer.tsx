'use client';

import Link from 'next/link';
import { SUPPORT_EMAIL } from '@/lib/config';

const footerLinks = {
  company: [
    { name: 'About Us', href: '/about' },
    { name: 'Services', href: '/services' },
    { name: 'Blog', href: '/blog' },
    { name: 'Contact', href: '/contact' },
  ],
  support: [
    { name: 'Help Center', href: '/help' },
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'FAQ', href: '/faq' },
  ],
  services: [
    { name: 'Essay Writing', href: '/services/essay-writing' },
    { name: 'Research Papers', href: '/services/research-papers' },
    { name: 'Dissertations', href: '/services/dissertations' },
    { name: 'Editing', href: '/services/editing' },
    { name: 'GMAT Prep', href: '/services/gmat-prep' },
    { name: 'NCLEX Prep', href: '/services/nclex-prep' },
  ],
};

export function Footer() {
  return (
    <footer className="border-t bg-muted/50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
                <span className="text-lg font-bold text-primary-foreground">E</span>
              </div>
              <span className="text-xl font-bold">Einstein Essay Tutors</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              Professional academic writing services with expert tutors, delivering quality work on
              time.
            </p>
            <div className="flex space-x-4">
              <Link
                href={`mailto:${SUPPORT_EMAIL}`}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                {SUPPORT_EMAIL}
              </Link>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map(link => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services Links */}
          <div>
            <h3 className="font-semibold mb-4">Services</h3>
            <ul className="space-y-3">
              {footerLinks.services.map(link => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-3">
              {footerLinks.support.map(link => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Disclaimer Section */}
        <div className="mt-8">
          <div className="bg-muted/30 rounded-lg p-4">
            <h4 className="font-semibold text-sm mb-2">Academic Integrity Disclaimer</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Einstein Essay Tutors does not tolerate any form of plagiarism. All tutoring services,
              materials, and assistance provided are strictly for educational guidance and reference
              purposes only. Our services are designed to help students improve their academic
              skills and understanding of subject matter. The materials and guidance provided should
              not be submitted for grading or academic evaluation as original work. Students are
              responsible for using our services ethically and in accordance with their
              institution's academic integrity policies.
            </p>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Einstein Essay Tutors. All rights reserved.
          </p>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
              Privacy
            </Link>
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
