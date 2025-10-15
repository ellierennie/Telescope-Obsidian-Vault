---
note: Under construction
---

## See [[Navigation/Notes/Documentation|Documentation]]

==NOTE: These functions are currently under development==

## Function 
- KOI Stream this note 

 At present `KOI Stream this note` simply marks the active file as `KOI_Stream: true` which will be used by the KOI Sync plugin to locate files that a vault owner wants to share into a KOI repository. When using the function there is also a callout added to the bottom of the file that looks like below:

> [!INFO] KOI Stream
> Shared: 25.05.16


## Development

As this feature develops there will be more functions and requirements to forfill as a user shared files into KOI Stream. For instance they could select other system users to direct the stream instances with, which will enable material to be shared with relevant vault users who may be project collaborators or have an interest in the content streamed. The user sharing the material may also respond to a prompt to describe why the material is being shared into the KOI Stream, this will help generate connections points of reference for RAG systems trained over KOI data.  

At this point the file metadata, may include fields:

| Field             | Description                            |
| ----------------- | -------------------------------------- |
| {shareDate}       | When material was shared               |
| {vaulteOwnerName} | The author sharing into KOI            |
| {selectedUsers}   | The users material is directed at      |
| {userRational}    | Description of why material is shared  |
| {KOIrelatedNotes} | Related notes that exist in the KOI re |

streamed: {shareDate}
shared By: {vaulteOwnerName}
sharedWith: {selectedUsers}
shareReason: {userRational}
relatedKoiNotes: {relatedKoiNotes}

The callout will appear like

> [!INFO] KOI Stream
> Streamed: 25.05.16
> By: {vaulteOwnerName}
> With: {selectedUsers}
> Reason: {userRational}
> Related: {relatedKoiNotes}

## Batched Notes 
Another cool development would be to enable the creation and KOI streaming of 


