"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { ChevronDown, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";

import { SECTION_IDS } from "@/constants/sections";
import {
  INDUSTRY_OPTIONS,
  ANNUAL_REVENUE_OPTIONS,
  TARGET_COUNTRY_OPTIONS,
  EXPORT_EXPERIENCE_OPTIONS,
  FOOD_CATEGORY_OPTIONS,
} from "@/constants/form-options";
import { leadSchema, type LeadFormValues } from "@/lib/validations";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { gtagReportConversion } from "@/lib/gtag";
import Link from "next/link";

function formatBusinessNumber(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
}

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

export default function LeadCaptureForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOptional, setShowOptional] = useState(false);
  const [leadCount, setLeadCount] = useState(0);

  useEffect(() => {
    fetch("/api/leads/count")
      .then((res) => res.json())
      .then((data) => setLeadCount(data.count ?? 0))
      .catch(() => {});
  }, []);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm<LeadFormValues>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      target_countries: [],
      export_experience: "" as unknown as undefined,
      privacy_consent: false as unknown as true,
      marketing_consent: false,
    },
    mode: "onBlur",
  });

  const targetCountries = watch("target_countries");
  const privacyConsent = watch("privacy_consent");
  const marketingConsent = watch("marketing_consent");
  const exportExperience = watch("export_experience");

  const handleCountryToggle = (country: string) => {
    const current = targetCountries || [];
    const updated = current.includes(country)
      ? current.filter((c) => c !== country)
      : [...current, country];
    setValue("target_countries", updated, { shouldValidate: true });
  };

  const onSubmit = async (data: LeadFormValues) => {
    setIsSubmitting(true);
    try {
      const sessionId =
        typeof window !== "undefined"
          ? sessionStorage.getItem("xb_session_id") || ""
          : "";

      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, session_id: sessionId }),
      });

      if (res.status === 201) {
        gtagReportConversion();
        router.push("/thank-you");
        return;
      }

      const body = await res.json();

      if (res.status === 409) {
        toast.error(body.error || "이미 신청된 이메일입니다.");
        return;
      }

      if (body.errors) {
        Object.entries(body.errors).forEach(([, msg]) => {
          toast.error(msg as string);
        });
        return;
      }

      toast.error("신청 중 오류가 발생했습니다. 다시 시도해주세요.");
    } catch {
      toast.error("네트워크 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id={SECTION_IDS.FORM} className="bg-[#F8FAFC] py-24">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          <motion.div variants={fadeInUp} className="text-center">
            <h2 className="text-3xl font-bold text-[#1E293B] sm:text-4xl">
              사전 신청서
            </h2>
            <p className="mt-4 text-lg text-[#64748B]">
              1분이면 끝! 간단한 정보 입력으로 특별 혜택을 받으세요
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#22C55E] opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#22C55E]" />
              </span>
              <span className="text-sm text-[#64748B]">
                {leadCount > 0 ? (
                  <>
                    현재{" "}
                    <span className="font-semibold text-[#1E293B]">
                      {leadCount.toLocaleString()}
                    </span>
                    개 기업이 사전 신청 완료
                  </>
                ) : (
                  "사전 신청 접수 중"
                )}
              </span>
            </div>
          </motion.div>

          <motion.form
            variants={fadeInUp}
            onSubmit={handleSubmit(onSubmit)}
            className="mt-12 space-y-6 rounded-2xl bg-white p-6 shadow-sm sm:p-8"
          >
            {/* 필수 정보 */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="company_name">
                  회사명 <span className="text-[#EF4444]">*</span>
                </Label>
                <Input
                  id="company_name"
                  placeholder="주식회사 예시"
                  {...register("company_name")}
                  onBlur={() => trigger("company_name")}
                  className="mt-1"
                />
                {errors.company_name && (
                  <p className="mt-1 text-sm text-[#EF4444]">
                    {errors.company_name.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="email">
                  이메일 <span className="text-[#EF4444]">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@company.com"
                  {...register("email")}
                  onBlur={() => trigger("email")}
                  className="mt-1"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-[#EF4444]">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="business_number">사업자등록번호</Label>
                  <Input
                    id="business_number"
                    placeholder="000-00-00000"
                    {...register("business_number")}
                    onChange={(e) => {
                      const formatted = formatBusinessNumber(e.target.value);
                      setValue("business_number", formatted);
                    }}
                    onBlur={() => trigger("business_number")}
                    className="mt-1"
                  />
                  {errors.business_number && (
                    <p className="mt-1 text-sm text-[#EF4444]">
                      {errors.business_number.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="contact_name">담당자명</Label>
                  <Input
                    id="contact_name"
                    placeholder="홍길동"
                    {...register("contact_name")}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="food_category">대표 식품 카테고리</Label>
                <Select
                  onValueChange={(v) =>
                    setValue("food_category", v as string, { shouldValidate: true })
                  }
                >
                  <SelectTrigger id="food_category" className="mt-1">
                    <SelectValue placeholder="선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {FOOD_CATEGORY_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>
                  관심 수출국 <span className="text-[#EF4444]">*</span>
                </Label>
                <div className="mt-2 flex flex-wrap gap-3">
                  {TARGET_COUNTRY_OPTIONS.map((opt) => (
                    <label
                      key={opt.value}
                      className={`flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-colors ${
                        targetCountries?.includes(opt.value)
                          ? "border-[#1E40AF] bg-[#1E40AF]/5 text-[#1E40AF]"
                          : "border-[#E2E8F0] text-[#64748B] hover:border-[#3B82F6]"
                      }`}
                    >
                      <Checkbox
                        checked={targetCountries?.includes(opt.value)}
                        onCheckedChange={() => handleCountryToggle(opt.value)}
                        className="sr-only"
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
                {errors.target_countries && (
                  <p className="mt-1 text-sm text-[#EF4444]">
                    {errors.target_countries.message}
                  </p>
                )}
              </div>
            </div>

            {/* 추가 정보 토글 */}
            <div>
              <button
                type="button"
                onClick={() => setShowOptional(!showOptional)}
                className="flex w-full items-center justify-center gap-1 text-sm text-[#64748B] transition-colors hover:text-[#1E40AF]"
              >
                추가 정보 입력 (선택)
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${showOptional ? "rotate-180" : ""}`}
                />
              </button>

              {showOptional && (
                <div className="mt-4 space-y-6 border-t border-[#E2E8F0] pt-6">
                  {/* 기업 추가 정보 */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="industry">업종/제품군</Label>
                      <Select
                        onValueChange={(v) =>
                          setValue("industry", v as LeadFormValues["industry"], {
                            shouldValidate: true,
                          })
                        }
                      >
                        <SelectTrigger id="industry" className="mt-1">
                          <SelectValue placeholder="선택하세요" />
                        </SelectTrigger>
                        <SelectContent>
                          {INDUSTRY_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="annual_revenue">연 매출 규모</Label>
                      <Select
                        onValueChange={(v) =>
                          setValue(
                            "annual_revenue",
                            v as LeadFormValues["annual_revenue"],
                            { shouldValidate: true }
                          )
                        }
                      >
                        <SelectTrigger id="annual_revenue" className="mt-1">
                          <SelectValue placeholder="선택하세요" />
                        </SelectTrigger>
                        <SelectContent>
                          {ANNUAL_REVENUE_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* 담당자 정보 */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="position">직책</Label>
                      <Input
                        id="position"
                        placeholder="예: 대표, 해외영업팀장"
                        {...register("position")}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone">연락처</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="010-0000-0000"
                        {...register("phone")}
                        onChange={(e) => {
                          const formatted = formatPhone(e.target.value);
                          setValue("phone", formatted);
                        }}
                        onBlur={() => trigger("phone")}
                        className="mt-1"
                      />
                      {errors.phone && (
                        <p className="mt-1 text-sm text-[#EF4444]">
                          {errors.phone.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* 수출 경험 */}
                  <div>
                    <Label>현재 수출 경험</Label>
                    <RadioGroup
                      value={exportExperience ?? ""}
                      onValueChange={(v) =>
                        setValue(
                          "export_experience",
                          v as LeadFormValues["export_experience"],
                          { shouldValidate: true }
                        )
                      }
                      className="mt-2 flex flex-wrap gap-4"
                    >
                      {EXPORT_EXPERIENCE_OPTIONS.map((opt) => (
                        <label
                          key={opt.value}
                          className="flex cursor-pointer items-center gap-2"
                        >
                          <RadioGroupItem value={opt.value} />
                          <span className="text-sm text-[#1E293B]">
                            {opt.label}
                          </span>
                        </label>
                      ))}
                    </RadioGroup>
                  </div>

                  {/* 추가 문의 */}
                  <div>
                    <Label htmlFor="additional_notes">추가 문의사항</Label>
                    <Textarea
                      id="additional_notes"
                      placeholder="궁금하신 점이나 요청사항을 자유롭게 입력해주세요"
                      rows={3}
                      {...register("additional_notes")}
                      className="mt-1"
                    />
                    {errors.additional_notes && (
                      <p className="mt-1 text-sm text-[#EF4444]">
                        {errors.additional_notes.message}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 동의 */}
            <div className="space-y-3">
              <label className="flex items-start gap-3">
                <Checkbox
                  checked={privacyConsent === true}
                  onCheckedChange={(checked) =>
                    setValue("privacy_consent", checked === true ? true : (false as unknown as true), {
                      shouldValidate: true,
                    })
                  }
                  className="mt-0.5"
                />
                <span className="text-sm text-[#1E293B]">
                  <span className="font-medium text-[#EF4444]">[필수]</span>{" "}
                  <Link
                    href="/privacy"
                    target="_blank"
                    className="underline hover:text-[#1E40AF]"
                  >
                    개인정보 수집 및 이용
                  </Link>
                  에 동의합니다
                </span>
              </label>
              {errors.privacy_consent && (
                <p className="text-sm text-[#EF4444]">
                  {errors.privacy_consent.message}
                </p>
              )}

              <label className="flex items-start gap-3">
                <Checkbox
                  checked={marketingConsent === true}
                  onCheckedChange={(checked) =>
                    setValue("marketing_consent", checked === true, {
                      shouldValidate: true,
                    })
                  }
                  className="mt-0.5"
                />
                <span className="text-sm text-[#64748B]">
                  [선택] 마케팅 정보 수신에 동의합니다
                </span>
              </label>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-14 w-full bg-[#F97316] text-lg font-semibold text-white shadow-lg shadow-[#F97316]/25 transition-all hover:bg-[#EA580C] hover:shadow-xl hover:shadow-[#F97316]/30 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  신청 중...
                </>
              ) : (
                "사전 신청하기"
              )}
            </Button>

            <p className="text-center text-sm text-[#64748B]">
              신청 완료 후 정식 출시 시 가장 먼저 안내해 드리겠습니다.
            </p>
          </motion.form>
        </motion.div>
      </div>
    </section>
  );
}
