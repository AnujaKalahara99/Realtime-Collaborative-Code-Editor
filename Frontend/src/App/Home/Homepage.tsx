import React, { useState, useEffect } from "react";
import {
  Code2,
  Users,
  Play,
  Github,
  Twitter,
  Mail,
  ArrowRight,
  CheckCircle,
  Moon,
  Sun,
  Terminal,
  Share2,
  GitBranch,
  UserPlus,
} from "lucide-react";
import { useNavigate } from "react-router";
import { useTheme } from "../../Contexts/ThemeProvider";

const CodeEditorHomepage: React.FC = () => {
  const [typedText, setTypedText] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const codeText = 'function collaborate() {\n  return "real-time magic";\n}';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      if (i < codeText.length) {
        setTypedText(codeText.substring(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
      }
    }, 100);

    return () => clearInterval(timer);
  }, []);

  const handleLoginRedirect = () => {
    // Redirect to login page
    navigate("/login");
  };

  const handleSignupRedirect = () => {
    // Redirect to signup page
    navigate("/signup");
  };

  const features = [
    {
      icon: <Users className="w-6 h-6 text-blue-400" />,
      title: "Real-Time Collaboration",
      description:
        "Google Docs-style collaborative coding with live cursors, auto-synchronization, and integrated chat.",
    },
    {
      icon: <Terminal className="w-6 h-6 text-yellow-400" />,
      title: "Development Environment",
      description:
        "VS Code-like experience with syntax highlighting, autocompletion, and secure code execution.",
    },
    {
      icon: <GitBranch className="w-6 h-6 text-green-400" />,
      title: "Version Control",
      description:
        "Git-like functionality with commit history, branches, and rollback capabilities.",
    },
    {
      icon: <UserPlus className="w-6 h-6 text-purple-400" />,
      title: "Role-Based Access",
      description:
        "Comprehensive user management for teams, educational institutions, and organizations.",
    },
  ];

  const pricingPlans = [
    {
      name: "Free",
      price: "$0",
      period: "/month",
      features: [
        "Up to 3 collaborators",
        "5 projects",
        "Basic code execution",
        "Community support",
      ],
      popular: false,
    },
    {
      name: "Pro",
      price: "$12",
      period: "/month",
      features: [
        "Unlimited collaborators",
        "Unlimited projects",
        "Advanced environments",
        "Priority support",
        "Version control",
      ],
      popular: true,
    },
    {
      name: "Team",
      price: "$24",
      period: "/month",
      features: [
        "Everything in Pro",
        "Team management",
        "SSO integration",
        "Custom environments",
        "Dedicated support",
      ],
      popular: false,
    },
  ];

  // Use theme classes for consistent styling
  const bgClass = isDark ? "bg-gray-900" : "bg-white";

  const surfaceClass = isDark ? "bg-gray-800" : "bg-gray-50";

  const secondarySurfaceClass = isDark ? "bg-gray-700" : "bg-gray-100";

  const borderClass = isDark ? "border-gray-600" : "border-gray-300";

  const textClass = isDark ? "text-white" : "text-gray-900";

  const secondaryTextClass = isDark ? "text-gray-300" : "text-gray-700";

  const mutedTextClass = isDark ? "text-gray-400" : "text-gray-500";

  return (
    <div className={`min-h-screen ${bgClass}`}>
      {/* Header */}
      <header
        className={`fixed top-0 w-full z-40 transition-all duration-300 ${
          isScrolled ? `${surfaceClass} border-b ${borderClass}` : `${bgClass}`
        }`}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Code2 className="w-6 h-6 text-blue-500 mr-2" />
              <span className={`text-xl font-semibold ${textClass}`}>
                RTC-Editor
              </span>
            </div>

            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <a
                  href="#features"
                  className={`${secondaryTextClass} hover:${textClass} transition-colors`}
                >
                  Features
                </a>
                <a
                  href="#use-cases"
                  className={`${secondaryTextClass} hover:${textClass} transition-colors`}
                >
                  Use Cases
                </a>
                <a
                  href="#pricing"
                  className={`${secondaryTextClass} hover:${textClass} transition-colors`}
                >
                  Pricing
                </a>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-md ${secondarySurfaceClass} ${secondaryTextClass}`}
                aria-label="Toggle theme"
              >
                {isDark ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>

              <button
                onClick={handleLoginRedirect}
                className={`${secondaryTextClass} hover:${textClass} transition-colors`}
              >
                Sign In
              </button>

              <button
                onClick={handleSignupRedirect}
                className={`${surfaceClass} ${textClass} px-4 py-2 rounded-md font-medium hover:${secondarySurfaceClass} transition-colors border ${borderClass}`}
              >
                Get Started
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1
                className={`text-4xl md:text-5xl font-bold leading-tight ${textClass}`}
              >
                Real-Time Collaborative Code Editor
              </h1>

              <p
                className={`text-xl ${secondaryTextClass} max-w-lg leading-relaxed`}
              >
                Experience seamless, real-time code editing and teamwork—just
                like collaborating in Google Docs, but purpose-built for
                developers.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  // onClick={handleSignupRedirect}
                  onClick={handleLoginRedirect}
                  className={`flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors`}
                >
                  Start Coding Now
                  <ArrowRight className="ml-2 w-4 h-4" />
                </button>

                <button
                  className={`flex items-center justify-center px-6 py-3 border ${borderClass} ${textClass} rounded-md font-medium hover:${secondarySurfaceClass} transition-colors`}
                >
                  <Play className="mr-2 w-4 h-4" />
                  Watch Demo
                </button>
              </div>
            </div>

            <div
              className={`rounded-lg overflow-hidden border ${borderClass} ${surfaceClass}`}
            >
              <div
                className={`flex items-center ${secondarySurfaceClass} px-4 py-2 border-b ${borderClass}`}
              >
                <div className="flex space-x-2 mr-4">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <div className={`text-sm ${mutedTextClass} flex-1`}>
                  collaborative-project.js
                </div>
                <div className="flex items-center">
                  <Share2 className={`w-4 h-4 ${mutedTextClass} mr-3`} />
                  <div className="flex -space-x-2">
                    <div className="w-6 h-6 bg-blue-500 rounded-full border-2 border-gray-900 flex items-center justify-center text-xs font-semibold">
                      A
                    </div>
                    <div className="w-6 h-6 bg-green-500 rounded-full border-2 border-gray-900 flex items-center justify-center text-xs font-semibold">
                      B
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 font-mono text-sm">
                <div className="flex">
                  <div
                    className={`text-right pr-4 ${mutedTextClass} select-none`}
                  >
                    <div>1</div>
                    <div>2</div>
                    <div>3</div>
                    <div>4</div>
                  </div>

                  <div className="flex-1 overflow-x-auto">
                    <div className="text-purple-400">
                      {typedText.split("\n").map((line, index) => (
                        <div key={index} className="min-h-[1.25rem]">
                          {line}
                          {index === typedText.split("\n").length - 1 && (
                            <span className="animate-pulse">|</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div
                  className={`mt-4 text-xs ${mutedTextClass} border-t ${borderClass} pt-2`}
                >
                  <span className="flex items-center">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
                    User A is typing...
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className={`py-16 px-4 ${surfaceClass}`}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className={`text-3xl font-bold ${textClass} mb-4`}>
              Built for Modern Development
            </h2>
            <p className={`${secondaryTextClass} max-w-2xl mx-auto`}>
              A comprehensive platform for real-time collaborative coding with
              integrated testing, version control, and team management.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`p-6 ${bgClass} rounded-lg border ${borderClass}`}
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className={`text-lg font-semibold ${textClass} mb-2`}>
                  {feature.title}
                </h3>
                <p className={`${mutedTextClass}`}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section id="use-cases" className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className={`text-3xl font-bold ${textClass} mb-4`}>
              Perfect for Every Team
            </h2>
            <p className={`${secondaryTextClass} max-w-2xl mx-auto`}>
              Our platform adapts to various use cases across different teams
              and organizations.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div
              className={`p-6 ${surfaceClass} rounded-lg border ${borderClass}`}
            >
              <h3 className={`text-lg font-semibold ${textClass} mb-3`}>
                Educational Institutions
              </h3>
              <ul className={`${secondaryTextClass} space-y-2`}>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>
                    Interactive coding sessions with real-time instructor
                    supervision
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Assignment management with submission tracking</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Student collaboration on group projects</span>
                </li>
              </ul>
            </div>

            <div
              className={`p-6 ${surfaceClass} rounded-lg border ${borderClass}`}
            >
              <h3 className={`text-lg font-semibold ${textClass} mb-3`}>
                Development Teams
              </h3>
              <ul className={`${secondaryTextClass} space-y-2`}>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Pair programming and collaborative code reviews</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Code execution in standardized environments</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Version control with team-based operations</span>
                </li>
              </ul>
            </div>

            <div
              className={`p-6 ${surfaceClass} rounded-lg border ${borderClass}`}
            >
              <h3 className={`text-lg font-semibold ${textClass} mb-3`}>
                Organizations
              </h3>
              <ul className={`${secondaryTextClass} space-y-2`}>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Corporate training programs and coding bootcamps</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Hackathons with real-time judging</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Remote collaboration across global teams</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className={`py-16 px-4 ${surfaceClass}`}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className={`text-3xl font-bold ${textClass} mb-4`}>
              Simple, Transparent Pricing
            </h2>
            <p className={`${secondaryTextClass} max-w-2xl mx-auto`}>
              Choose the perfect plan for your team. Upgrade or downgrade at any
              time.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <div
                key={index}
                className={`p-6 ${bgClass} rounded-lg border ${
                  plan.popular ? "border-blue-500" : borderClass
                }`}
              >
                {plan.popular && (
                  <div
                    className={`mb-4 py-1 px-3 bg-blue-600 text-white text-xs font-semibold rounded-md inline-block`}
                  >
                    Most Popular
                  </div>
                )}

                <div className="mb-6">
                  <h3 className={`text-xl font-bold ${textClass} mb-2`}>
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline">
                    <span className={`text-3xl font-bold ${textClass}`}>
                      {plan.price}
                    </span>
                    <span className={`${mutedTextClass} ml-1`}>
                      {plan.period}
                    </span>
                  </div>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, featureIndex) => (
                    <li
                      key={featureIndex}
                      className={`flex items-center ${secondaryTextClass}`}
                    >
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={handleSignupRedirect}
                  className={`w-full py-2 rounded-md font-medium ${
                    plan.popular
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : `${secondarySurfaceClass} ${textClass} hover:${bgClass}`
                  } transition-colors`}
                >
                  Get Started
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className={`text-3xl font-bold ${textClass} mb-4`}>
            Ready to Transform Your Development Workflow?
          </h2>
          <p className={`${secondaryTextClass} mb-8`}>
            Join thousands of developers who are already coding collaboratively
            with CodeSync.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleSignupRedirect}
              className="px-6 py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors"
            >
              Start Free Trial
            </button>

            <button
              className={`px-6 py-3 border ${borderClass} ${textClass} rounded-md font-medium hover:${secondarySurfaceClass} transition-colors`}
            >
              Schedule Demo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`border-t ${borderClass} py-8 px-4`}>
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Code2 className="w-5 h-5 text-blue-500 mr-2" />
                <span className={`font-semibold ${textClass}`}>CodeSync</span>
              </div>
              <p className={`${mutedTextClass} mb-4`}>
                The future of collaborative coding is here. Build amazing things
                together.
              </p>
              <div className="flex space-x-4">
                <Github
                  className={`w-5 h-5 ${mutedTextClass} hover:${textClass} cursor-pointer transition-colors`}
                />
                <Twitter
                  className={`w-5 h-5 ${mutedTextClass} hover:${textClass} cursor-pointer transition-colors`}
                />
                <Mail
                  className={`w-5 h-5 ${mutedTextClass} hover:${textClass} cursor-pointer transition-colors`}
                />
              </div>
            </div>

            <div>
              <h3 className={`${textClass} font-semibold mb-3`}>Product</h3>
              <ul className={`space-y-2 ${mutedTextClass}`}>
                <li>
                  <a
                    href="#features"
                    className={`hover:${textClass} transition-colors`}
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#pricing"
                    className={`hover:${textClass} transition-colors`}
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className={`hover:${textClass} transition-colors`}
                  >
                    API
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className={`${textClass} font-semibold mb-3`}>Resources</h3>
              <ul className={`space-y-2 ${mutedTextClass}`}>
                <li>
                  <a
                    href="#"
                    className={`hover:${textClass} transition-colors`}
                  >
                    Documentation
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className={`hover:${textClass} transition-colors`}
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className={`hover:${textClass} transition-colors`}
                  >
                    Community
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className={`${textClass} font-semibold mb-3`}>Company</h3>
              <ul className={`space-y-2 ${mutedTextClass}`}>
                <li>
                  <a
                    href="#"
                    className={`hover:${textClass} transition-colors`}
                  >
                    About
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className={`hover:${textClass} transition-colors`}
                  >
                    Contact
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className={`hover:${textClass} transition-colors`}
                  >
                    Legal
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div
            className={`border-t ${borderClass} mt-8 pt-6 text-center ${mutedTextClass}`}
          >
            <p>© 2025 RTC-Editor. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CodeEditorHomepage;
