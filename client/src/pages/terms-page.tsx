import { Link } from "wouter";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-neutral-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <Link href="/">
            <h1 className="text-3xl font-bold text-primary cursor-pointer">RocksOTPs</h1>
          </Link>
          <h2 className="mt-4 text-2xl font-bold text-neutral-900">Terms and Conditions</h2>
          <p className="mt-2 text-neutral-600">Last updated: May 9, 2023</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="prose max-w-none">
            <h3 className="text-xl font-semibold">1. Introduction</h3>
            <p>
              Welcome to RocksOTPs ("we", "our", or "us"). By accessing or using our OTP service platform, you agree to be bound by these Terms and Conditions. Please read them carefully.
            </p>
            
            <h3 className="text-xl font-semibold mt-6">2. Definitions</h3>
            <p>
              <strong>"OTP"</strong> means One-Time Password generated for authentication purposes.<br />
              <strong>"Platform"</strong> means the RocksOTPs website and services.<br />
              <strong>"User"</strong> means any individual who accesses or uses our Platform.
            </p>
            
            <h3 className="text-xl font-semibold mt-6">3. Account Registration</h3>
            <p>
              To use certain features of the Platform, you must register for an account. You agree to provide accurate, current, and complete information and to update such information to keep it accurate, current, and complete. We reserve the right to suspend or terminate your account if any information provided proves to be inaccurate, not current, or incomplete.
            </p>
            
            <h3 className="text-xl font-semibold mt-6">4. OTP Service</h3>
            <p>
              Our Platform provides OTP generation services for various applications. You agree to use these services only for legitimate and lawful purposes. Misuse of our OTP services for fraudulent or unauthorized activities is strictly prohibited.
            </p>
            
            <h3 className="text-xl font-semibold mt-6">5. Wallet System</h3>
            <p>
              The Platform includes a wallet system for purchasing OTP services. All transactions are final and non-refundable unless required by law. We reserve the right to modify pricing at any time.
            </p>
            
            <h3 className="text-xl font-semibold mt-6">6. User Conduct</h3>
            <p>
              You agree not to use the Platform to:
            </p>
            <ul className="list-disc pl-5 mt-2">
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe upon the rights of others</li>
              <li>Distribute malware or other harmful code</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Engage in fraudulent activities</li>
            </ul>
            
            <h3 className="text-xl font-semibold mt-6">7. Limitation of Liability</h3>
            <p>
              In no event shall we be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses.
            </p>
            
            <h3 className="text-xl font-semibold mt-6">8. Changes to Terms</h3>
            <p>
              We reserve the right to modify these Terms at any time. We will provide notice of material changes by posting the amended terms on the Platform. Your continued use of the Platform after the changes are made constitutes your agreement to the revised Terms.
            </p>
            
            <h3 className="text-xl font-semibold mt-6">9. Contact Us</h3>
            <p>
              If you have any questions about these Terms, please contact us at support@rocksotps.com.
            </p>
          </div>
          
          <div className="mt-8 flex justify-center">
            <Link href="/">
              <button className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary-dark transition-colors">
                Return to Home
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}