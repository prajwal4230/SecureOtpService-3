import { FiCreditCard } from "react-icons/fi";
import { SiGooglepay, SiPaytm, SiPhonepe } from "react-icons/si";

export function PaymentIcons() {
  return (
    <div className="flex flex-wrap justify-center space-x-8">
      <div className="h-12 w-auto flex items-center justify-center grayscale opacity-75 hover:grayscale-0 hover:opacity-100 transition-all">
        <span className="bg-neutral-100 rounded-lg p-2 flex items-center justify-center">
          <FiCreditCard className="text-neutral-800 text-xl" />
          <span className="ml-2 font-medium text-neutral-800">UPI QR</span>
        </span>
      </div>
      <div className="h-12 w-auto flex items-center justify-center grayscale opacity-75 hover:grayscale-0 hover:opacity-100 transition-all">
        <span className="bg-neutral-100 rounded-lg p-2 flex items-center justify-center">
          <SiPhonepe className="text-neutral-800 text-xl" />
          <span className="ml-2 font-medium text-neutral-800">PhonePe</span>
        </span>
      </div>
      <div className="h-12 w-auto flex items-center justify-center grayscale opacity-75 hover:grayscale-0 hover:opacity-100 transition-all">
        <span className="bg-neutral-100 rounded-lg p-2 flex items-center justify-center">
          <SiGooglepay className="text-neutral-800 text-xl" />
          <span className="ml-2 font-medium text-neutral-800">GPay</span>
        </span>
      </div>
      <div className="h-12 w-auto flex items-center justify-center grayscale opacity-75 hover:grayscale-0 hover:opacity-100 transition-all">
        <span className="bg-neutral-100 rounded-lg p-2 flex items-center justify-center">
          <SiPaytm className="text-neutral-800 text-xl" />
          <span className="ml-2 font-medium text-neutral-800">Paytm</span>
        </span>
      </div>
    </div>
  );
}
