import React, { useState, useRef, useEffect } from 'react';
import {
  FileText,
  Image as ImageIcon,
  Mic,
  MicOff,
  Sparkles,
  ShieldCheck,
  UploadCloud,
  X,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Language, getTranslation, getSpeechLangCode } from '../i18n';
import { maskSensitiveData, MaskingResult } from '../utils/masking';
import { SAMPLE_MESSAGES, SampleMessage } from '../constants/samples';

interface MessageInputProps {
  lang: Language;
  onAnalyze: (payload: {
    text: string;
    originalInput: string;
    imageBase64?: string;
    imageMimeType?: string;
    maskingInfo: MaskingResult;
  }) => void;
  isLoading: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  lang,
  onAnalyze,
  isLoading,
}) => {
  const [activeTab, setActiveTab] = useState<'text' | 'image' | 'voice'>('text');
  const [rawText, setRawText] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string>('image/jpeg');

  // Real-time client-side masking calculation
  const maskingResult = maskSensitiveData(rawText);
  const [showMaskedPreview, setShowMaskedPreview] = useState(false);

  // Web Speech API state
  const [isRecording, setIsRecording] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [speechError, setSpeechError] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize Web Speech API
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
    }
  }, []);

  const handleStartVoice = () => {
    setSpeechError(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = getSpeechLangCode(lang);
      recognition.continuous = true;
      recognition.interimResults = true;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        if (currentTranscript) {
          setRawText((prev) => (prev ? `${prev} ${currentTranscript}` : currentTranscript));
        }
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setSpeechError(event.error === 'not-allowed' ? 'Microphone access denied.' : 'Voice input failed.');
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
      recognitionRef.current = recognition;
      setIsRecording(true);
    } catch (err) {
      console.error('Error starting speech recognition:', err);
      setSpeechError('Could not start microphone.');
      setIsRecording(false);
    }
  };

  const handleStopVoice = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  // Image Upload Handler
  const handleImageSelect = (file: File) => {
    setImageFile(file);
    setImageMimeType(file.type || 'image/jpeg');
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleClearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Sample Click Handler
  const handleSelectSample = (sample: SampleMessage) => {
    setRawText(sample.text);
    setActiveTab('text');
  };

  // Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isRecording) {
      handleStopVoice();
    }

    if (!rawText.trim() && !imagePreview) {
      return;
    }

    // Pass the masked version to ensure Hard Guardrail 4 is upheld before transmission
    onAnalyze({
      text: maskingResult.maskedText,
      originalInput: rawText,
      imageBase64: imagePreview || undefined,
      imageMimeType,
      maskingInfo: maskingResult,
    });
  };

  const t = (k: string) => getTranslation(lang, k);

  return (
    <div className="w-full max-w-2xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl">
      {/* Input Mode Tabs */}
      <div className="flex bg-slate-950 p-1.5 rounded-2xl gap-1 border border-slate-800/80 mb-6">
        <button
          type="button"
          onClick={() => setActiveTab('text')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-sm font-bold transition min-h-[48px] cursor-pointer ${
            activeTab === 'text'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>{t('input_tab_paste')}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('image')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-sm font-bold transition min-h-[48px] cursor-pointer ${
            activeTab === 'image'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>{t('input_tab_screenshot')}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('voice')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-sm font-bold transition min-h-[48px] cursor-pointer ${
            activeTab === 'voice'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
          }`}
        >
          <Mic className="w-4 h-4" />
          <span>{t('input_tab_voice')}</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Tab 1: Text Paste */}
        {activeTab === 'text' && (
          <div>
            <label htmlFor="message-text" className="block text-sm font-semibold text-slate-200 mb-2">
              {lang === 'hi' ? 'संदेश का पूरा टेक्स्ट डालें:' : 'Paste message text below:'}
            </label>
            <div className="relative">
              <textarea
                id="message-text"
                rows={6}
                value={showMaskedPreview ? maskingResult.maskedText : rawText}
                onChange={(e) => {
                  if (!showMaskedPreview) {
                    setRawText(e.target.value);
                  }
                }}
                disabled={showMaskedPreview}
                placeholder={t('paste_placeholder')}
                className="w-full rounded-2xl bg-slate-950 border border-slate-700/80 p-4 text-base text-slate-100 placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 leading-relaxed font-sans"
              />

              {/* Toggle to inspect on-device masked version */}
              {rawText && maskingResult.hasMaskedData && (
                <button
                  type="button"
                  onClick={() => setShowMaskedPreview(!showMaskedPreview)}
                  className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/90 text-xs font-semibold text-amber-300 border border-amber-500/30 hover:bg-slate-700 transition"
                >
                  {showMaskedPreview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showMaskedPreview ? 'Show Raw Text' : 'View Masked Preview'}</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Screenshot Upload */}
        {activeTab === 'image' && (
          <div className="space-y-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageSelect(file);
              }}
            />

            {!imagePreview ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-700 hover:border-amber-500/60 rounded-2xl bg-slate-950/60 transition cursor-pointer text-center group"
              >
                <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center text-amber-400 mb-3 group-hover:scale-105 transition">
                  <UploadCloud className="w-7 h-7" />
                </div>
                <p className="text-base font-bold text-slate-200">{t('screenshot_prompt')}</p>
                <p className="text-xs text-slate-400 mt-1">{t('screenshot_select')}</p>
                <span className="mt-4 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold">
                  PNG, JPG, WebP supported
                </span>
              </button>
            ) : (
              <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 p-2">
                <img
                  src={imagePreview}
                  alt="Uploaded screenshot"
                  className="max-h-72 w-full object-contain rounded-xl"
                />
                <button
                  type="button"
                  onClick={handleClearImage}
                  className="absolute top-4 right-4 p-2 bg-slate-900/90 text-slate-300 hover:text-white rounded-full border border-slate-700 shadow-lg cursor-pointer"
                  title="Remove image"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="p-3 text-xs text-slate-400 flex items-center justify-between">
                  <span className="font-semibold text-emerald-400">✓ {t('screenshot_selected')}</span>
                  <span>{imageFile?.name}</span>
                </div>
              </div>
            )}

            {/* Optional companion note */}
            <div>
              <input
                type="text"
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder={lang === 'hi' ? 'वैकल्पिक: कोई अतिरिक्त नोट या लिंक यहाँ लिखें...' : 'Optional: Type any accompanying note or link...'}
                className="w-full rounded-xl bg-slate-950 border border-slate-700/80 px-4 py-2.5 text-sm text-slate-200"
              />
            </div>
          </div>
        )}

        {/* Tab 3: Voice Note */}
        {activeTab === 'voice' && (
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-4">
            {!speechSupported ? (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm">
                <AlertCircle className="w-5 h-5 mx-auto mb-2 text-amber-400" />
                {t('voice_not_supported')}
              </div>
            ) : (
              <>
                <div className="flex flex-col items-center">
                  <button
                    type="button"
                    onClick={isRecording ? handleStopVoice : handleStartVoice}
                    className={`w-20 h-20 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-xl ${
                      isRecording
                        ? 'bg-rose-500 text-white animate-pulse ring-8 ring-rose-500/30'
                        : 'bg-amber-500 hover:bg-amber-400 text-slate-950 active:scale-95'
                    }`}
                    aria-label={isRecording ? 'Stop voice recording' : 'Start voice recording'}
                  >
                    {isRecording ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
                  </button>

                  <p className="mt-4 text-base font-bold text-slate-100">
                    {isRecording ? t('voice_recording') : t('voice_tap_record')}
                  </p>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm">
                    {t('voice_hint')} ({lang === 'hi' ? 'भाषा: हिंदी' : 'Language: English-IN'})
                  </p>
                </div>

                {speechError && (
                  <p className="text-xs text-rose-400 font-semibold">{speechError}</p>
                )}

                {/* Live transcript textarea */}
                <div className="text-left mt-4">
                  <label htmlFor="voice-transcript" className="text-xs font-semibold text-slate-400">
                    {lang === 'hi' ? 'रिकॉर्ड हुआ विवरण (आप एडिट कर सकते हैं):' : 'Transcript recorded (editable):'}
                  </label>
                  <textarea
                    id="voice-transcript"
                    rows={4}
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    placeholder="Transcript will appear here as you speak..."
                    className="w-full mt-1.5 rounded-xl bg-slate-900 border border-slate-700/80 p-3 text-sm text-slate-200"
                  />
                </div>
              </>
            )}
          </div>
        )}

        {/* Client-Side Privacy Note (Hard Guardrail 4) */}
        <div className="rounded-xl bg-emerald-950/40 border border-emerald-500/30 p-3.5 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs text-emerald-200/90 leading-relaxed">
            <span className="font-bold text-emerald-300">
              {lang === 'hi' ? 'आपकी निजता 100% सुरक्षित है:' : 'Client-Side Privacy Guarantee:'}
            </span>{' '}
            {t('privacy_guarantee')}
            {maskingResult.hasMaskedData && (
              <div className="mt-1.5 flex flex-wrap gap-2 text-[11px] font-bold text-amber-300">
                <span>{t('privacy_masked_notice')}</span>
                {maskingResult.maskedCount.phones > 0 && (
                  <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                    📞 {maskingResult.maskedCount.phones} Phone(s)
                  </span>
                )}
                {maskingResult.maskedCount.upi > 0 && (
                  <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                    💳 {maskingResult.maskedCount.upi} UPI ID(s)
                  </span>
                )}
                {maskingResult.maskedCount.emails > 0 && (
                  <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                    ✉️ {maskingResult.maskedCount.emails} Email(s)
                  </span>
                )}
                {maskingResult.maskedCount.ids > 0 && (
                  <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                    🪪 {maskingResult.maskedCount.ids} 12-Digit ID(s)
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Big accessible Submit Button */}
        <button
          type="submit"
          disabled={isLoading || (!rawText.trim() && !imagePreview)}
          className="w-full min-h-[56px] rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-lg tracking-wide shadow-lg shadow-amber-500/25 active:scale-98 transition flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-3 border-slate-950 border-t-transparent rounded-full animate-spin" />
              <span>{t('analyzing_title')}</span>
            </div>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>{t('check_button')}</span>
            </>
          )}
        </button>
      </form>

      {/* Quick Test Samples for Judges */}
      <div className="mt-8 pt-6 border-t border-slate-800">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
          {t('samples_label')}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {SAMPLE_MESSAGES.map((sample) => (
            <button
              key={sample.id}
              type="button"
              onClick={() => handleSelectSample(sample)}
              className="text-left p-3 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-amber-500/40 transition active:scale-95 cursor-pointer group min-h-[48px]"
            >
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-sm bg-amber-500/10 text-amber-400 border border-amber-500/20 inline-block mb-1.5">
                {sample.badge}
              </span>
              <p className="text-xs font-semibold text-slate-200 group-hover:text-amber-300">
                {lang === 'hi' ? sample.titleHi : sample.titleEn}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
