import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/admin-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function AdminReservations() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");

  const { data: reservations } = useQuery({
    queryKey: ["/api/reservations", statusFilter, dateFilter],
    queryFn: () => {
      const params = new URLSearchParams();
      if (statusFilter && statusFilter !== "all") params.append("status", statusFilter);
      if (dateFilter) params.append("date", dateFilter);
      return fetch(`/api/reservations?${params}`).then(res => res.json());
    },
  });

  const updateReservation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return apiRequest(`/api/reservations/${id}`, "PATCH", { status });
    },
    onSuccess: () => {
      toast({
        title: "Reservation Updated",
        description: "Reservation status has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/reservations"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteReservation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/api/reservations/${id}`, "DELETE");
    },
    onSuccess: () => {
      toast({
        title: "Reservation Deleted",
        description: "Reservation has been permanently deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/reservations"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "confirmed":
        return "default";
      case "pending":
        return "secondary";
      case "cancelled":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-success/20 text-success";
      case "pending":
        return "bg-warning/20 text-warning";
      case "cancelled":
        return "bg-danger/20 text-danger";
      default:
        return "bg-muted/20 text-muted-foreground";
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground uppercase">Reservation Management</h1>
          <p className="text-muted-foreground">Manage customer reservations</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger data-testid="select-status-filter">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              placeholder="Filter by date"
              data-testid="input-date-filter"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setStatusFilter("all");
              setDateFilter("");
            }}
            data-testid="button-clear-filters"
          >
            Clear Filters
          </Button>
        </div>

        {/* Reservations Grid */}
        <div className="grid grid-cols-1 gap-4">
          {Array.isArray(reservations) && reservations.map((reservation: any) => (
            <Card key={reservation.id} className="card-shadow" data-testid={`card-reservation-${reservation.id}`}>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-card-foreground">{reservation.fullName}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(reservation.status)}`}>
                        {reservation.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-sm text-muted-foreground">
                      <div>
                        <i className="fas fa-envelope mr-2 text-accent"></i>
                        {reservation.email}
                      </div>
                      <div>
                        <i className="fas fa-phone mr-2 text-accent"></i>
                        {reservation.phone}
                      </div>
                      <div>
                        <i className="fas fa-calendar mr-2 text-accent"></i>
                        {new Date(reservation.dateTime).toLocaleDateString()}
                      </div>
                      <div>
                        <i className="fas fa-clock mr-2 text-accent"></i>
                        {new Date(reservation.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div>
                        <i className="fas fa-users mr-2 text-accent"></i>
                        {reservation.people} {reservation.people === 1 ? 'person' : 'people'}
                      </div>
                      {reservation.notes && (
                        <div className="flex-1">
                          <i className="fas fa-sticky-note mr-2 text-accent"></i>
                          {reservation.notes}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {reservation.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          className="bg-success text-background hover:opacity-90"
                          onClick={() => updateReservation.mutate({ id: reservation.id, status: "confirmed" })}
                          disabled={updateReservation.isPending}
                          data-testid={`button-confirm-${reservation.id}`}
                        >
                          Confirm
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => updateReservation.mutate({ id: reservation.id, status: "cancelled" })}
                          disabled={updateReservation.isPending}
                          data-testid={`button-cancel-${reservation.id}`}
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                    {reservation.status === "confirmed" && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => updateReservation.mutate({ id: reservation.id, status: "cancelled" })}
                        disabled={updateReservation.isPending}
                        data-testid={`button-cancel-${reservation.id}`}
                      >
                        Cancel
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (confirm('Bu rezervasyonu kalıcı olarak silmek istediğinizden emin misiniz?')) {
                          deleteReservation.mutate(reservation.id);
                        }
                      }}
                      disabled={deleteReservation.isPending}
                      data-testid={`button-delete-${reservation.id}`}
                      className="text-destructive hover:text-destructive"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {(!Array.isArray(reservations) || reservations.length === 0) && (
          <div className="text-center py-12" data-testid="text-no-reservations">
            <p className="text-xl text-muted-foreground">No reservations found</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
