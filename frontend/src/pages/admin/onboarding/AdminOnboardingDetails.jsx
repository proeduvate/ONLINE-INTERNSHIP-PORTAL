import React from "react";
import { PageContainer } from "../../../components/layout/PageContainer";
import { Card, CardContent } from "../../../components/ui/Card";

export default function AdminOnboardingDetails() {
  return (
    <PageContainer>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div className="header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "20px", borderBottom: "1px solid var(--border-color)", marginBottom: "24px" }}>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: 'var(--text-darker)' }}>
            Onboarding Application Details
          </h2>
        </div>

        <Card style={{ animation: "fadeIn 0.3s ease-out" }}>
          <CardContent style={{ padding: '24px' }}>
            <p style={{ color: 'var(--text-muted)' }}>Application details coming soon.</p>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
