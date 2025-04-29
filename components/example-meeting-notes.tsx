"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Copy } from "lucide-react"
import { useState } from "react"

export function ExampleMeetingNotes() {
  const [copied, setCopied] = useState<string | null>(null)

  const examples = {
    projectUpdate: `
Project Status Meeting - Marketing Campaign
Date: April 25, 2025
Attendees: Marketing Team, Product Team, Sales Representatives

Agenda:
1. Q2 Campaign Status
2. Website Redesign Update
3. New Product Launch Timeline
4. Action Items Review

Notes:

Marketing Campaign Update:
- Social media campaign is performing well, 20% above expected engagement
- Sarah mentioned we need to finalize the Q2 budget proposal by next Friday
- Team agreed we need to follow up with the design team about the new banner ads
- Decision needed on whether to extend the current promotion for another week

Website Redesign:
- Development team reported they're behind schedule due to technical issues
- John will provide updated timeline by Wednesday
- Content team needs to deliver final copy for the homepage by May 5th
- UX testing is scheduled for May 10-12

Product Launch:
- Manufacturing confirmed the product will be ready for June 1 launch
- Marketing materials are 80% complete
- Alex still needs to coordinate with PR team on press release
- Emma will follow up with sales team about training materials

Previous Action Items:
- The customer persona updates have been completed by the research team
- Still waiting on final approval for the new logo design
- Social media guidelines document is still in progress, Jamie needs another week

Next Steps:
- Weekly status updates to continue
- Next meeting scheduled for May 2nd
- All teams to submit written updates by April 30th
    `,
    teamMeeting: `
Weekly Team Sync
April 27, 2025

Present: Full team
Absent: Taylor (vacation)

Updates:

Engineering:
- Backend API integration is complete
- Frontend team is still working on the dashboard, expected to be done by Thursday
- Jordan mentioned we need to decide on the authentication provider by tomorrow
- Performance testing revealed some issues that need to be addressed

Design:
- New mockups for mobile app are ready for review
- Still waiting on feedback for the landing page redesign
- Alex will follow up with the client about color scheme preferences

Product:
- User research for new feature is complete
- Jamie needs to update the roadmap with Q3 priorities
- Decision needed on feature prioritization for next sprint

Customer Success:
- Two major support issues were resolved last week
- Training materials need to be updated by May 15
- Casey will coordinate with marketing on customer case studies

Action Items:
- Engineering team to fix performance issues by Friday
- Everyone to review mobile app mockups by Wednesday
- Schedule meeting with client to discuss color scheme
- Jordan to prepare authentication provider options
- Casey and marketing to meet about case studies next Monday
- Jamie to present updated roadmap at next meeting
    `,
    clientMeeting: `
Client Meeting: Acme Corporation
April 26, 2025

Attendees:
- Our team: Sarah, John, Alex
- Client: Mark, Lisa, David

Project: Website Redesign and Marketing Campaign

Discussion Points:

Current Status:
- Phase 1 of website redesign is 70% complete
- Initial marketing materials have been approved
- Content migration is behind schedule

Client Feedback:
- Very happy with the new design direction
- Concerned about timeline for launch
- Requested additional social media assets
- Would like weekly status updates going forward

Technical Issues:
- Integration with client's CRM system is more complex than anticipated
- John will investigate alternatives and provide options by next Friday
- Decision needed on whether to proceed with current approach or switch to alternative

Budget:
- Current spending is within budget
- Client approved additional budget for social media assets
- Sarah to send updated quote by tomorrow

Timeline:
- Original launch date of May 15 is at risk
- Team proposed new launch date of May 30
- Client will confirm if this is acceptable by end of week

Action Items:
- Sarah to send updated quote for additional social media assets
- John to investigate CRM integration alternatives
- Alex to schedule weekly status update calls
- Client to provide final content for About Us page by Wednesday
- Team to deliver revised timeline document by Monday
- Follow up on the SEO strategy that was discussed last month
    `,
  }

  const handleCopy = (type: string) => {
    navigator.clipboard.writeText(examples[type as keyof typeof examples])
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Example Meeting Notes</CardTitle>
        <CardDescription>Use these examples to test the meeting notes analyzer</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="projectUpdate" className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="projectUpdate">Project Update</TabsTrigger>
            <TabsTrigger value="teamMeeting">Team Meeting</TabsTrigger>
            <TabsTrigger value="clientMeeting">Client Meeting</TabsTrigger>
          </TabsList>

          {Object.entries(examples).map(([key, content]) => (
            <TabsContent key={key} value={key} className="relative">
              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-md text-sm font-mono whitespace-pre-wrap max-h-[300px] overflow-y-auto">
                {content}
              </div>
              <Button size="sm" variant="outline" className="absolute top-2 right-2" onClick={() => handleCopy(key)}>
                <Copy className="h-4 w-4 mr-1" />
                {copied === key ? "Copied!" : "Copy"}
              </Button>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}
