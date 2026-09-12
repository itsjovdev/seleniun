// src/pages/tools/SignPdf.tsx
import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { LocaleSEO } from "@/lib/locale-utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Upload,
  FileSignature,
  FileType,
  CheckCircle,
  AlertCircle,
  Eraser,
  ArrowRight,
  ArrowLeft,
  Image as ImageIcon,
  PenTool,
} from "lucide-react";
import ToolsCTA from "@/components/nav/ToolsCTA";
import Breadcrumbs from "@/components/nav/Breadcrumbs";
import ToolContentSections from "@/components/nav/ToolContentSections";
import SignaturePad from "signature_pad";
import { PDFDocument } from "pdf-lib";

type SignatureMethod = 'draw' | 'upload' | null;

export default function SignPdf() {
  // Step-by-step flow states
  const { t } = useI18n();
  const [currentStep, setCurrentStep] = useState<'upload' | 'signature' | 'place' | 'done'>('upload');

  // File state
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Signature method
  const [signatureMethod, setSignatureMethod] = useState<SignatureMethod>(null);

  // Drawn signature
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sigPadRef = useRef<SignaturePad | null>(null);

  // Final signature (can be drawn or uploaded)
  const [signatureImage, setSignatureImage] = useState<string | null>(null);
  const [signaturePosition, setSignaturePosition] = useState({ x: 200, y: 300, width: 150 });

  // PDF preview - simplified without rendering
  const [pdfInfo, setPdfInfo] = useState<{pages: number, size: {width: number, height: number}} | null>(null);

  // UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Initialize SignaturePad when draw method is selected
  useEffect(() => {
    if (canvasRef.current && signatureMethod === 'draw') {
      console.log("Initializing SignaturePad...");

      // Clean up existing instance
      if (sigPadRef.current) {
        sigPadRef.current.clear();
        sigPadRef.current.off();
      }

      const canvas = canvasRef.current;
      const container = canvas.parentElement;

      // Get container dimensions for responsive scaling
      const containerRect = container?.getBoundingClientRect();
      const containerWidth = containerRect?.width || 600;

      // Set canvas dimensions based on container
      const canvasWidth = Math.min(600, containerWidth - 32); // 32px for padding
      const canvasHeight = 200;

      // Set actual canvas size
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      // Set CSS size to match exactly (no scaling)
      canvas.style.width = canvasWidth + 'px';
      canvas.style.height = canvasHeight + 'px';

      // Create new SignaturePad instance
      sigPadRef.current = new SignaturePad(canvas, {
        minWidth: 1,
        maxWidth: 3,
        penColor: 'black',
        backgroundColor: 'white',
        velocityFilterWeight: 0.7,
        minDistance: 5,
      });

      // Handle window resize to maintain calibration
      const handleResize = () => {
        if (!canvasRef.current || !sigPadRef.current) return;

        const canvas = canvasRef.current;
        const container = canvas.parentElement;
        const containerRect = container?.getBoundingClientRect();
        const containerWidth = containerRect?.width || 600;

        // Save signature data before resize
        const signatureData = sigPadRef.current.toData();

        // Recalculate dimensions
        const newCanvasWidth = Math.min(600, containerWidth - 32);
        const newCanvasHeight = 200;

        // Update canvas dimensions
        canvas.width = newCanvasWidth;
        canvas.height = newCanvasHeight;
        canvas.style.width = newCanvasWidth + 'px';
        canvas.style.height = newCanvasHeight + 'px';

        // Restore signature data
        sigPadRef.current.fromData(signatureData);
      };

      // Add resize listener with debounce
      let resizeTimeout: NodeJS.Timeout;
      const debouncedResize = () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(handleResize, 100);
      };

      window.addEventListener('resize', debouncedResize);
      window.addEventListener('orientationchange', debouncedResize);

      console.log("SignaturePad initialized successfully");

      // Cleanup function
      return () => {
        window.removeEventListener('resize', debouncedResize);
        window.removeEventListener('orientationchange', debouncedResize);
        clearTimeout(resizeTimeout);
      };
    }

    // Cleanup function
    return () => {
      if (sigPadRef.current && signatureMethod !== 'draw') {
        sigPadRef.current.clear();
        sigPadRef.current = null;
      }
    };
  }, [signatureMethod]);

  // Clear signature when method changes
  useEffect(() => {
    if (signatureMethod !== 'draw') {
      setSignatureImage(null);
    }
  }, [signatureMethod]);

  // Get PDF info when moving to place step
  useEffect(() => {
    if (!file || currentStep !== 'place') return;

    const getPdfInfo = async () => {
      try {
        console.log("Getting PDF info...");
        const pdfBytes = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const firstPage = pdfDoc.getPage(0);
        const { width, height } = firstPage.getSize();

        setPdfInfo({
          pages: pdfDoc.getPageCount(),
          size: { width, height }
        });

        console.log("PDF info loaded:", { pages: pdfDoc.getPageCount(), width, height });
      } catch (err) {
        console.error("Error getting PDF info:", err);
        setError(t("tool.failedLoadPdf"));
      }
    };

    getPdfInfo();
  }, [file, currentStep, t]);

  // Handle PDF file drag & drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    const pdfFile = files.find((f) => f.type === "application/pdf");
    if (pdfFile) {
      setFile(pdfFile);
      setError(null);
      console.log("PDF file dropped:", pdfFile.name);
    } else {
      setError(t("tool.onlyPdfAllowed"));
    }
  };

  // Select PDF file
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] ?? null;
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setError(null);
      console.log("PDF file selected:", selectedFile.name);
    } else {
      setError(t("tool.selectValidPdf"));
    }
  };

  // Upload signature image
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const imageFile = e.target.files?.[0];
    if (!imageFile) return;

    if (!imageFile.type.startsWith('image/')) {
      setError(t("tool.selectValidImage"));
      return;
    }

    console.log("Signature image selected:", imageFile.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setSignatureImage(result);
      setError(null);
      console.log("Signature image loaded successfully");
    };
    reader.readAsDataURL(imageFile);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const clearDrawnSignature = () => {
    if (sigPadRef.current) {
      sigPadRef.current.clear();
    }
    setSignatureImage(null);
    console.log("Signature cleared");
  };

  const saveDrawnSignature = () => {
    if (!sigPadRef.current || sigPadRef.current.isEmpty()) {
      setError(t("tool.drawFirst"));
      return;
    }
    const dataURL = sigPadRef.current.toDataURL("image/png");
    setSignatureImage(dataURL);
    setError(null);
    console.log("Signature saved successfully");
  };

  // Reset signature method and clear everything
  const resetSignatureMethod = () => {
    if (sigPadRef.current) {
      sigPadRef.current.clear();
      sigPadRef.current = null;
    }
    setSignatureMethod(null);
    setSignatureImage(null);
    setError(null);
  };

  // Navigate between steps
  const goToNextStep = () => {
    if (currentStep === 'upload' && file) {
      setCurrentStep('signature');
      console.log("Moving to signature step");
    } else if (currentStep === 'signature' && signatureImage) {
      setCurrentStep('place');
      console.log("Moving to place step");
    }
  };

  const goToPreviousStep = () => {
    if (currentStep === 'signature') {
      setCurrentStep('upload');
    } else if (currentStep === 'place') {
      setCurrentStep('signature');
    }
  };

  // Handle position change for signature
  const updateSignaturePosition = (x: number, y: number) => {
    setSignaturePosition({
      x: Math.max(0, Math.min(x, (pdfInfo?.size.width || 600) - signaturePosition.width)),
      y: Math.max(0, Math.min(y, (pdfInfo?.size.height || 800) - 50)),
      width: signaturePosition.width
    });
  };

  // Sign and download PDF
  const signAndDownloadPdf = async () => {
    if (!file || !signatureImage) return;

    try {
      setError(null);
      setLoading(true);
      console.log("Starting PDF signing process...");

      console.log("Loading PDF document...");
      const pdfBytes = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(pdfBytes);

      console.log("Converting signature image to bytes...");
      const response = await fetch(signatureImage);
      const imageBytes = await response.arrayBuffer();

      let embeddedImage;
      if (signatureImage.startsWith('data:image/png')) {
        console.log("Embedding PNG signature...");
        embeddedImage = await pdfDoc.embedPng(imageBytes);
      } else {
        console.log("Embedding JPG signature...");
        embeddedImage = await pdfDoc.embedJpg(imageBytes);
      }

      console.log("Getting first page...");
      const firstPage = pdfDoc.getPage(0);
      const { width: pageWidth, height: pageHeight } = firstPage.getSize();
      console.log("Page size:", pageWidth, "x", pageHeight);

      // Calculate signature size and position
      const signatureWidth = signaturePosition.width;
      const aspectRatio = embeddedImage.height / embeddedImage.width;
      const signatureHeight = signatureWidth * aspectRatio;

      // PDF coordinates (origin at bottom-left)
      const pdfX = signaturePosition.x;
      const pdfY = pageHeight - signaturePosition.y - signatureHeight;

      console.log("Drawing signature at:", pdfX, pdfY, "Size:", signatureWidth, "x", signatureHeight);

      // Draw signature on PDF
      firstPage.drawImage(embeddedImage, {
        x: pdfX,
        y: pdfY,
        width: signatureWidth,
        height: signatureHeight,
      });

      console.log("Saving PDF...");
      const pdfBytesOutput = await pdfDoc.save();
      const blob = new Blob([new Uint8Array(pdfBytesOutput)], { type: "application/pdf" });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${file.name.replace(/\.pdf$/i, "")}-signed.pdf`;
      link.click();
      URL.revokeObjectURL(url);

      console.log("PDF signed and downloaded successfully!");
      setCurrentStep('done');
      setSuccess(true);

    } catch (err: any) {
      console.error("PDF signing error:", err);
      console.error("Error details:", err.message, err.stack);
      setError(`${t("tool.failedSign")}: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const resetTool = () => {
    console.log("Resetting tool...");
    setCurrentStep('upload');
    setFile(null);
    setSignatureMethod(null);
    setSignatureImage(null);
    setError(null);
    setSuccess(false);
    setPdfInfo(null);
    setSignaturePosition({ x: 200, y: 300, width: 150 });
    if (sigPadRef.current) {
      sigPadRef.current.clear();
    }
  };

  return (
    <>
      <LocaleSEO path="/tools/sign-pdf" title={t("seo.signPdf.title")} description={t("seo.signPdf.description")} />
      <Breadcrumbs items={[{ label: t("breadcrumb.tools"), href: "/#tools" }, { label: t("signPdf.title") }]} />

      {/* Hero */}
      <section className="pb-4">
        <div className="container py-12 text-center">
          <div className="inline-flex items-center gap-2 bg-teal-100 text-teal-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <FileSignature className="w-4 h-4" />
            {t("signPdf.badge")}
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gray-900">
            {t("signPdf.heading")} <span className="text-teal-600">PDF</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-500 mb-8 max-w-2xl mx-auto leading-relaxed">
            {t("signPdf.subtitle")} <strong className="text-gray-700">{t("tool.freeSecureFast")}</strong>
          </p>

          {/* Step indicator */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-4 max-w-4xl mx-auto px-4">
            {[
              { step: 'upload', label: t("signPdf.stepUpload"), number: 1, icon: Upload },
              { step: 'signature', label: t("signPdf.stepCreate"), number: 2, icon: PenTool },
              { step: 'place', label: t("signPdf.stepPlace"), number: 3, icon: FileSignature }
            ].map(({ step, label, number, icon: Icon }, index) => (
              <div key={step} className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto">
                {/* Step card */}
                <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all duration-300 min-w-0 ${
                  currentStep === step
                    ? 'bg-teal-600 text-white border-teal-600 shadow-lg scale-105'
                    : ['signature', 'place'].includes(currentStep) && step === 'upload'
                    ? 'bg-green-500 text-white border-green-500 shadow-md'
                    : currentStep === 'place' && step === 'signature'
                    ? 'bg-green-500 text-white border-green-500 shadow-md'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                }`}>
                  {/* Number or checkmark */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                    currentStep === step
                      ? 'bg-white text-teal-600'
                      : (['signature', 'place'].includes(currentStep) && step === 'upload') ||
                        (currentStep === 'place' && step === 'signature')
                      ? 'bg-white text-green-500'
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {(['signature', 'place'].includes(currentStep) && step === 'upload') ||
                     (currentStep === 'place' && step === 'signature') ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      number
                    )}
                  </div>

                  {/* Icon and label */}
                  <div className="flex items-center gap-2 min-w-0">
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                      {label}
                    </span>
                  </div>
                </div>

                {/* Arrow connector - only between steps, not after last */}
                {index < 2 && (
                  <div className="hidden sm:block">
                    <ArrowRight className="w-5 h-5 text-gray-300" />
                  </div>
                )}

                {/* Vertical connector for mobile */}
                {index < 2 && (
                  <div className="block sm:hidden w-px h-6 bg-gray-200"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Tool */}
      <section className="container pb-16">
        <div className="max-w-4xl mx-auto">
          <Card className="border border-gray-200 shadow-xl">
            <CardContent className="p-6 md:p-10">

              {/* STEP 1: Upload PDF */}
              {currentStep === 'upload' && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold mb-2">{t("signPdf.step1")}</h2>
                    <p className="text-muted-foreground">{t("signPdf.step1Hint")}</p>
                  </div>

                  <div
                    className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer ${
                      dragOver
                        ? "border-teal-500 bg-teal-50 scale-[1.01]"
                        : file
                        ? "border-teal-400 bg-teal-50"
                        : "border-gray-300 hover:border-teal-400 hover:bg-gray-50"
                    }`}
                    onDrop={handleDrop}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="application/pdf"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    {!file ? (
                      <div>
                        <Upload className="w-16 h-16 text-teal-600 mx-auto mb-4" />
                        <p className="text-xl font-medium mb-2">{t("tool.dropPdf")}</p>
                        <p className="text-muted-foreground mb-4">{t("common.or")} {t("common.clickToSelect")}</p>
                        <Button
                          variant="outline"
                          className="pointer-events-none touch-none"
                          tabIndex={-1}
                        >
                          {t("common.selectFile")}
                        </Button>
                      </div>
                    ) : (
                      <div>
                        <FileType className="w-16 h-16 text-green-600 mx-auto mb-4" />
                        <p className="text-xl font-medium mb-1">{file.name}</p>
                        <p className="text-muted-foreground mb-4">{formatFileSize(file.size)}</p>
                        <CheckCircle className="w-8 h-8 text-green-500 mx-auto" />
                      </div>
                    )}
                  </div>

                  {file && (
                    <div className="text-center">
                      <Button onClick={goToNextStep} className="px-8 py-3 text-lg">
                        {t("signPdf.continue")} <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 2: Create signature */}
              {currentStep === 'signature' && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold mb-2">{t("signPdf.step2")}</h2>
                    <p className="text-muted-foreground">{t("signPdf.step2Hint")}</p>
                  </div>

                  {/* Method selector */}
                  {!signatureMethod && (
                    <div className="grid md:grid-cols-2 gap-6">
                      <Card
                        className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
                        onClick={() => setSignatureMethod('draw')}
                      >
                        <CardContent className="p-8 text-center">
                          <PenTool className="w-12 h-12 text-teal-600 mx-auto mb-4" />
                          <h3 className="text-xl font-semibold mb-2">{t("signPdf.draw")}</h3>
                          <p className="text-muted-foreground">{t("signPdf.drawHint")}</p>
                        </CardContent>
                      </Card>

                      <Card
                        className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
                        onClick={() => setSignatureMethod('upload')}
                      >
                        <CardContent className="p-8 text-center">
                          <ImageIcon className="w-12 h-12 text-ocean-700 mx-auto mb-4" />
                          <h3 className="text-xl font-semibold mb-2">{t("signPdf.uploadImg")}</h3>
                          <p className="text-muted-foreground">{t("signPdf.uploadImgHint")}</p>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* Draw signature */}
                  {signatureMethod === 'draw' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">{t("signPdf.drawYour")}</h3>
                        <Button variant="ghost" onClick={resetSignatureMethod}>
                          {t("signPdf.changeMethod")}
                        </Button>
                      </div>

                      <div className="border-2 rounded-lg p-4 bg-white">
                        <div className="flex justify-center">
                          <canvas
                            ref={canvasRef}
                            className="border-2 border-dashed border-gray-300 rounded cursor-crosshair block"
                            style={{
                              touchAction: 'none',
                              maxWidth: '100%',
                              height: 'auto'
                            }}
                          />
                        </div>
                      </div>

                      <div className="flex gap-3 justify-center">
                        <Button variant="outline" onClick={clearDrawnSignature}>
                          <Eraser className="w-4 h-4 mr-2" />
                          {t("signPdf.clear")}
                        </Button>
                        <Button onClick={saveDrawnSignature}>
                          {t("signPdf.save")}
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Upload signature image */}
                  {signatureMethod === 'upload' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">{t("signPdf.uploadImg")}</h3>
                        <Button variant="ghost" onClick={resetSignatureMethod}>
                          {t("signPdf.changeMethod")}
                        </Button>
                      </div>

                      <div className="border-2 border-dashed rounded-lg p-8 text-center">
                        <input
                          ref={imageInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        <ImageIcon className="w-12 h-12 text-ocean-700 mx-auto mb-4" />
                        <p className="mb-4">{t("signPdf.uploadImgSelect")}</p>
                        <Button onClick={() => imageInputRef.current?.click()}>
                          {t("common.selectImage")}
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Signature preview */}
                  {signatureImage && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-center">{t("signPdf.previewTitle")}</h3>
                      <div className="flex justify-center">
                        <div className="border rounded-lg p-4 bg-white">
                          <img
                            src={signatureImage}
                            alt="Signature"
                            className="max-w-xs max-h-24 object-contain"
                          />
                        </div>
                      </div>

                      <div className="flex gap-3 justify-center">
                        <Button variant="outline" onClick={goToPreviousStep}>
                          <ArrowLeft className="w-4 h-4 mr-2" />
                          {t("signPdf.back")}
                        </Button>
                        <Button onClick={goToNextStep}>
                          {t("signPdf.continue")}
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 3: Place signature */}
              {currentStep === 'place' && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold mb-2">{t("signPdf.step3")}</h2>
                    <p className="text-muted-foreground">{t("signPdf.step3Hint")}</p>
                  </div>

                  {/* PDF representation and signature positioning */}
                  {pdfInfo && (
                    <div className="space-y-6">
                      <div className="flex justify-center">
                        <div
                          className="relative border-2 border-gray-200 rounded-xl shadow-lg overflow-hidden bg-white"
                          style={{
                            width: '400px',
                            height: '500px',
                            background: 'linear-gradient(to bottom, #f8f9fa 0%, #e9ecef 100%)'
                          }}
                        >
                          {/* PDF representation */}
                          <div className="absolute inset-4 bg-white border shadow-sm rounded flex items-center justify-center">
                            <div className="text-center text-gray-500">
                              <FileType className="w-16 h-16 mx-auto mb-2 text-gray-400" />
                              <p className="text-sm">{file?.name}</p>
                              <p className="text-xs text-gray-400">
                                {pdfInfo.pages} {pdfInfo.pages > 1 ? t("page.pagesPlural") : t("page.pages")}
                              </p>
                            </div>
                          </div>

                          {/* Signature overlay */}
                          {signatureImage && (
                            <div
                              className="absolute border-2 border-blue-500 border-dashed bg-blue-50/50 rounded"
                              style={{
                                left: `${(signaturePosition.x / pdfInfo.size.width) * 100}%`,
                                top: `${(signaturePosition.y / pdfInfo.size.height) * 100}%`,
                                width: `${(signaturePosition.width / pdfInfo.size.width) * 100}%`,
                                height: 'auto',
                                minHeight: '30px'
                              }}
                            >
                              <img
                                src={signatureImage}
                                alt="Signature positioned"
                                className="w-full h-auto opacity-80"
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Position controls */}
                      <div className="space-y-4 max-w-md mx-auto">
                        <div>
                          <label className="block text-sm font-medium mb-2">{t("signPdf.hPosition")}</label>
                          <input
                            type="range"
                            min="0"
                            max={pdfInfo.size.width - signaturePosition.width}
                            value={signaturePosition.x}
                            onChange={(e) => updateSignaturePosition(parseInt(e.target.value), signaturePosition.y)}
                            className="w-full"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">{t("signPdf.vPosition")}</label>
                          <input
                            type="range"
                            min="0"
                            max={pdfInfo.size.height - 50}
                            value={signaturePosition.y}
                            onChange={(e) => updateSignaturePosition(signaturePosition.x, parseInt(e.target.value))}
                            className="w-full"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">{t("signPdf.sigSize")}</label>
                          <input
                            type="range"
                            min="50"
                            max="300"
                            value={signaturePosition.width}
                            onChange={(e) => setSignaturePosition({...signaturePosition, width: parseInt(e.target.value)})}
                            className="w-full"
                          />
                        </div>
                      </div>
                    </div>
                  )}
 <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button variant="outline" onClick={goToPreviousStep} className="w-full sm:w-auto">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      {t("signPdf.changeSignature")}
                    </Button>
                    <Button
                      onClick={signAndDownloadPdf}
                      disabled={loading || !pdfInfo}
                      className="w-full sm:w-auto px-8 py-3 text-lg bg-teal-600 hover:bg-teal-700 text-white disabled:opacity-50"
                    >
                      {loading ? t("common.processing") : t("signPdf.signDownload")}
                    </Button>
                  </div>       </div>
              )}

              {/* FINAL STEP: Completed */}
              {currentStep === 'done' && (
                <div className="text-center space-y-6">
                  <CheckCircle className="w-20 h-20 text-green-500 mx-auto" />
                  <h2 className="text-3xl font-bold text-green-600">{t("signPdf.signed")}</h2>
                  <p className="text-xl text-muted-foreground">
                    {t("tool.docDownloaded")}
                  </p>

                  <Button onClick={resetTool} className="px-8 py-3 text-lg">
                    {t("signPdf.signAnother")}
                  </Button>
                </div>
              )}

              {/* Error messages */}
              {error && (
                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="text-red-700">{error}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <ToolContentSections prefix="signPdf" accent="teal" />

          {/* CTA footer */}
          <ToolsCTA
            title={t("cta.needMore")}
            subtitle={t("cta.explore")}
            links={[
              { to: "/tools/encrypt-pdf", label: t("encryptPdf.title"), variant: "outline" },
              { to: "/tools/compress-pdf", label: t("compressPdf.compressBtn"), variant: "outline" },
              { to: "/#tools", label: t("cta.seeAllTools"), variant: "default" },
            ]}
          />
        </div>
      </section>
    </>
  );
}
