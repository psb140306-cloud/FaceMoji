"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Download, Plus } from "lucide-react";

export default function MyPage() {
  // TODO: Supabase에서 사용자 정보 + 생성 이력 가져오기
  const user = null;

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">로그인이 필요합니다</h1>
        <p className="mt-2 text-muted-foreground">
          이모티콘 생성 이력을 보려면 로그인해 주세요.
        </p>
        <Button asChild className="mt-6">
          <Link href="/login">로그인</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* 프로필 */}
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarFallback className="text-lg">FM</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-xl font-bold">마이페이지</h1>
          <p className="text-sm text-muted-foreground">이모티콘 생성 이력을 관리하세요</p>
        </div>
      </div>

      {/* 탭 */}
      <Tabs defaultValue="generations" className="mt-8">
        <TabsList>
          <TabsTrigger value="generations">생성 이력</TabsTrigger>
          <TabsTrigger value="downloads">다운로드</TabsTrigger>
        </TabsList>

        <TabsContent value="generations" className="mt-4">
          {/* 빈 상태 */}
          <Card>
            <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-3xl">
                🎨
              </div>
              <h3 className="text-lg font-bold">아직 생성한 이모티콘이 없어요</h3>
              <p className="text-sm text-muted-foreground">
                셀카 한 장으로 나만의 이모티콘을 만들어 보세요!
              </p>
              <Button asChild>
                <Link href="/create">
                  <Plus className="mr-2 h-4 w-4" />
                  이모티콘 만들기
                </Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="downloads" className="mt-4">
          <Card>
            <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-3xl">
                📦
              </div>
              <h3 className="text-lg font-bold">다운로드 내역이 없어요</h3>
              <p className="text-sm text-muted-foreground">
                결제 완료된 이모티콘이 여기에 표시됩니다.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 안내 */}
      <div className="mt-6 rounded-xl bg-muted/50 p-4">
        <p className="text-sm text-muted-foreground">
          미결제 이모티콘은 생성 후 7일간 보관됩니다. 결제 완료된 이모티콘은 영구 보관됩니다.
        </p>
      </div>
    </div>
  );
}
