"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Search, Plus, QrCode, Loader2, User, Delete } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { requireAuthAndRole } from "@/lib/utils/auth";
import AdminNavigation from "@/components/admin/admin-navigation";
import AdminHeader from "@/components/layout/admin-header";
import DeviceTable from "@/components/device/device-table";
import { Device, DeviceParams, DeviceStatus } from "@/lib/types/device";
import { deleteDevice, fetchAllDevices } from "@/lib/services/devices";
import { Loading } from "@/components/ui/loading";
import PaginationComponent from "@/components/ui/pagination-component";
import DeviceFilterForm from "@/components/device/device-filter-form";
import { set, useForm } from "react-hook-form";
import CreateDeviceDialog from "@/components/device/create-device-dialog";
import EditDeviceDialog from "@/components/device/edit-device-dialog";
import { exportQrPdf } from "@/lib/services/qr";

interface FilterFormData {
  name: string;
  status: string;
}

const AdminDashboard = () => {
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();

  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  // const [selectedDevices, setSelectedDevices] = useState<number[]>([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);

  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [curPage, setCurPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [isExporting, setIsExporting] = useState(true);
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);

  const { register, handleSubmit, setValue, watch } = useForm<FilterFormData>({
    defaultValues: {
      name: searchParams.get("name") || "",
      status: searchParams.get("status") || "",
    },
  });

  const statusValue = watch("status");

  const onSubmit = (data: FilterFormData) => {
    const params = new URLSearchParams();
    if (data.name) params.set("name", data.name);
    if (data.status && data.status !== "all") params.set("status", data.status);
    params.set("page", "1");
    setCurPage(1);
    router.replace(`?${params.toString()}`);
  };

  const handleChangeMode = () => {
    setIsExporting(false);
  }
  const handleExportQR = async () => {
    if (selectedDevices.length === 0) {
      toast({
        title: "Chưa chọn thiết bị",
        description: "Vui lòng chọn ít nhất một thiết bị để xuất QR",
        variant: "destructive",
      });

      return;
    }

    try {
      const pdf = await exportQrPdf(selectedDevices);

      const url = URL.createObjectURL(pdf);
      window.open(url, "_blank");

      toast({
        title: "Thành công",
        description: "Đã xuất QR PDF thành công!",
      });

      setIsExporting(false);
      setSelectedDevices([]);
    } catch (err: any) {
      toast({
        title: "Lỗi xuất QR",
        description: err.message || "Không thể xuất QR",
        variant: "destructive",
      });

      setIsExporting(false);
      setSelectedDevices([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedDevices((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleExitExportQR = () => {
    setIsExporting(true);
    setSelectedDevices([]);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    setCurPage(page);
    router.replace(`?${params.toString()}`);
  };

  const handleDeleteDevices = async (deviceId: string) => {
    const confirmed = window.confirm("Bạn có chắc chắn muốn xóa thiết bị này?");
    if (!confirmed) return;
    try {
      await deleteDevice(deviceId);
      toast({
        title: "Thành công",
        description: "Đã xóa thiết bị thành công.",
      });
      loadDevices();
    } catch (err: any) {
      const msg = err?.message ?? "Lỗi khi xóa thiết bị";
      toast({ title: "Lỗi", description: msg, variant: "destructive" });
    }
  };

  useEffect(() => {
    const ok = requireAuthAndRole(router, toast, ["ADMIN"]);
    setHasAccess(ok);
  }, [router, toast]);

  const loadDevices = useCallback(async () => {
    setLoading(true);
    try {
      const params: DeviceParams = {
        limit: 5,
        page: curPage,
        name: searchParams.get("name") || "",
      };

      const statusParam = searchParams.get("status") || "";
      if (statusParam && statusParam !== "all") {
        params.status = statusParam as DeviceStatus;
      }

      const res = await fetchAllDevices(params);
      console.log("Fetched devices:", res.data);
      setDevices(res.data);
      setTotalPages(res.meta.totalPages || 1);
    } catch (err: any) {
      const msg = err?.message ?? "Lỗi khi tải danh sách người dùng";
      toast({ title: "Lỗi", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [searchParams, curPage, toast]);

  useEffect(() => {
    if (hasAccess) loadDevices();
  }, [loadDevices, hasAccess]);

  if (hasAccess === null) return null;
  if (hasAccess === false) return null;

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <AdminHeader />
        <AdminNavigation />

        <Card className="glass-card">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <div>
                <CardTitle className="text-2xl">Quản lý thiết bị</CardTitle>
                <CardDescription className="mt-1">
                  Thêm, chỉnh sửa và quản lý tất cả thiết bị
                </CardDescription>
              </div>
              <div className="flex gap-2">
                {isExporting ? (
                  <Button
                    variant="outline"
                    onClick={handleChangeMode}
                    className="glass-button"
                  >
                    <QrCode />
                    <p>Chọn thiết bị xuất QR</p>
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      onClick={handleExitExportQR}
                      className="glass-button bg-red-400"
                    >
                      <Delete />
                    </Button>

                    <Button
                      variant="outline"
                      onClick={handleExportQR}
                      className="glass-button"
                    >
                      <QrCode />
                      <p>Xuất QR ({selectedDevices.length})</p>
                    </Button>
                  </>
                )}



                <Button onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm thiết bị
                </Button>
              </div>
            </div>

            <DeviceFilterForm
              register={register}
              handleSubmit={handleSubmit}
              setValue={setValue}
              statusValue={statusValue}
              onSubmit={onSubmit}
            />
          </CardHeader>
          {loading ? (
            <CardContent>
              <Loading />
            </CardContent>
          ) : (
            <CardContent>
              <DeviceTable
                devices={devices}
                onDelete={handleDeleteDevices}
                onEdit={(device) => {
                  setEditingDevice(device);
                  setEditDialogOpen(true);
                }}
                selectTable={!isExporting}
                selectIds={selectedDevices}
                onToggleSelect={handleToggleSelect}
              />
              <PaginationComponent
                currentPage={curPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </CardContent>
          )}
        </Card>

        <CreateDeviceDialog
          isOpen={createDialogOpen}
          onClose={() => setCreateDialogOpen(false)}
          onDeviceCreated={() => {
            setCreateDialogOpen(false);
            loadDevices();
          }}
        />
        <EditDeviceDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          device={editingDevice}
          onSuccess={() => {
            setEditingDevice(null);
            setEditDialogOpen(false);
            loadDevices();
          }}
        />
      </div>
    </div>
  );
};

export default AdminDashboard;
